import React, { useState, useCallback, useEffect, useRef } from "react";

import { Item } from "./types";
import { useUploadQueue } from "./useUploadQueue";
import { isDuplicate, uid, validateFile } from "./utils";

const ACCEPT = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;

export const A11yUploader = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // polite
  const [alert, setAlert] = useState<string | null>(null); // assertive

  const inputRef = useRef<HTMLInputElement | null>(null);
  const livePoliteRef = useRef<HTMLDivElement | null>(null);
  const liveAssertiveRef = useRef<HTMLDivElement | null>(null);

  useUploadQueue(items, setItems); // 자동 펌프

  // 정리: ObjectURL 해제
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
  }, []);

  const filesCount = items.length;
  const uploadingCount = items.filter((i) => i.status === "uploading").length;
  const successCount = items.filter((i) => i.status === "success").length;

  // 총괄 메시지
  useEffect(() => {
    setMessage(
      filesCount === 0
        ? "파일을 드래그하거나 클릭하여 선택하세요."
        : `${filesCount}개 항목(업로드 중: ${uploadingCount}, 성공: ${successCount})`
    );
  }, [filesCount, uploadingCount, successCount]);

  const onChooseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onKeyDownDropzone = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChooseClick();
      }
    },
    [onChooseClick]
  );

  const pushFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);

    setItems((prev) => {
      const next = [...prev];

      // 최대 개수 체크
      const remain = Math.max(0, MAX_FILES - next.length);
      const pick = arr.slice(0, remain);

      const dupFiltered: File[] = pick.filter(
        (f) => !next.some((x) => isDuplicate(f, x.file))
      );

      const toAdd: Item[] = [];
      const errors: string[] = [];

      dupFiltered.forEach((file) => {
        const err = validateFile(file);
        if (err) {
          errors.push(`${file.name}: ${err}`);
          return;
        }
        toAdd.push({
          id: uid(),
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: "queued",
        });
      });

      if (errors.length > 0) {
        setAlert(errors.join("\n"));
      }

      return [...next, ...toAdd];
    });
  }, []);

  // 드래그핸들러
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        pushFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [pushFiles]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        pushFiles(e.target.files);
        e.currentTarget.value = ""; // 동일 파일 재선택 허용
      }
    },
    [pushFiles]
  );

  // 개별 제어
  const cancelItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        if (it.status === "uploading" && it.abortCtrl) {
          it.abortCtrl.abort();
        }
        return { ...it, status: "canceled" };
      })
    );
  }, []);

  const retryItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, status: "queued", progress: 0, error: undefined }
          : it
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const startAll = useCallback(() => {
    // 이미 queued 상태면 pump가 시작함
    setItems((prev) =>
      prev.map((it) =>
        it.status === "idle" ||
        it.status === "error" ||
        it.status === "canceled"
          ? { ...it, status: "queued", progress: 0, error: undefined }
          : it
      )
    );
  }, []);

  const cancelAll = useCallback(() => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.status === "uploading" && it.abortCtrl) it.abortCtrl.abort();
        return {
          ...it,
          status: it.status === "success" ? it.status : "canceled",
        };
      })
    );
  }, []);

  // ====== 렌더 ======
  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-4">
        드래그앤드롭 파일 업로더 (스타터)
      </h1>

      {/* 라이브 리전 (접근성) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={livePoliteRef}
      >
        {message}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        ref={liveAssertiveRef}
      >
        {alert}
      </div>

      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 드롭존"
        aria-describedby="dropzone-desc"
        onKeyDown={onKeyDownDropzone}
        onClick={onChooseClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={
          "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 outline-none " +
          (isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400")
        }
      >
        <p id="dropzone-desc" className="text-center text-gray-700">
          이미지를 여기로 드래그하거나 <span className="underline">클릭</span>
          하여 선택하세요
        </p>
        <p className="text-xs text-gray-500">
          허용: PNG, JPEG, WEBP · 파일 당 최대 5MB · 최대 {MAX_FILES}개
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {/* 액션 바 */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={startAll}
          className="rounded-xl px-4 py-2 border border-gray-300 hover:bg-gray-50"
        >
          업로드 시작 / 재시작
        </button>
        <button
          type="button"
          onClick={cancelAll}
          className="rounded-xl px-4 py-2 border border-gray-300 hover:bg-gray-50"
        >
          전체 취소
        </button>
      </div>

      {/* 리스트 */}
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.id} className="rounded-2xl border border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {/* 이미지 미리보기 */}
                {it.previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.previewUrl}
                    alt={`${it.file.name} 미리보기`}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  title={it.file.name}
                >
                  {it.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(it.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {/* 진행률 + 상태 */}
            <div className="mt-3">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={it.progress}
                aria-label={`${it.file.name} 업로드 진행률`}
                className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  className={
                    "h-full transition-all " +
                    (it.status === "error"
                      ? "bg-red-400"
                      : it.status === "success"
                      ? "bg-green-400"
                      : "bg-blue-400")
                  }
                  style={{ width: `${it.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {it.status === "queued" && "대기 중"}
                {it.status === "uploading" && `업로드 중... ${it.progress}%`}
                {it.status === "success" && "완료"}
                {it.status === "error" &&
                  `실패: ${it.error || "알 수 없는 오류"}`}
                {it.status === "canceled" && "취소됨"}
              </p>
            </div>

            {/* 액션 */}
            <div className="mt-3 flex gap-2">
              {(it.status === "uploading" || it.status === "queued") && (
                <button
                  type="button"
                  onClick={() => cancelItem(it.id)}
                  className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  취소
                </button>
              )}
              {it.status === "error" && (
                <button
                  type="button"
                  onClick={() => retryItem(it.id)}
                  className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  재시도
                </button>
              )}
              {(it.status === "success" || it.status === "canceled") && (
                <a
                  href={it.serverUrl || it.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                >
                  보기
                </a>
              )}
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="ml-auto rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                aria-label={`${it.file.name} 항목 제거`}
              >
                제거
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* 토스트 느낌의 간단 안내 (시각적) */}
      {successCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl bg-black/80 px-4 py-2 text-sm text-white shadow-lg">
          {successCount}개 업로드 완료
        </div>
      )}
    </div>
  );
};
