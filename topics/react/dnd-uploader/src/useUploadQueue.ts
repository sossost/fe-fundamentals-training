import React, { useCallback, useEffect, useRef } from "react";
import { Item } from "./types";
import { mockUpload } from "./api";

const CONCURRENCY = 3;

export const useUploadQueue = (
  items: Item[],
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
) => {
  const running = useRef(0);

  const pump = useCallback(() => {
    if (running.current >= CONCURRENCY) return;

    setItems((prev) => {
      const next = [...prev];
      const available = CONCURRENCY - running.current;
      let started = 0;

      for (let i = 0; i < next.length && started < available; i++) {
        const it = next[i];
        if (it.status === "queued") {
          // 시작
          started++;
          running.current++;
          const ctrl = new AbortController();
          it.abortCtrl = ctrl;
          it.status = "uploading";

          // 비동기 업로드
          mockUpload(
            it.file,
            (p) => {
              setItems((cur) =>
                cur.map((x) => (x.id === it.id ? { ...x, progress: p } : x))
              );
            },
            ctrl.signal
          )
            .then(({ url }) => {
              setItems((cur) =>
                cur.map((x) =>
                  x.id === it.id
                    ? { ...x, status: "success", serverUrl: url, progress: 100 }
                    : x
                )
              );
            })
            .catch((err: unknown) => {
              const isAbort =
                err instanceof DOMException && err.name === "AbortError";
              setItems((cur) =>
                cur.map((x) =>
                  x.id === it.id
                    ? {
                        ...x,
                        status: isAbort ? "canceled" : "error",
                        error: isAbort ? undefined : (err as Error).message,
                      }
                    : x
                )
              );
            })
            .finally(() => {
              running.current--;
              // 다음 작업을 이어서
              setTimeout(pump, 0);
            });
        }
      }
      return next;
    });
  }, [setItems]);

  useEffect(() => {
    // 상태 변화 시 펌프 시도
    pump();
  }, [items, pump]);

  return { pump };
};
