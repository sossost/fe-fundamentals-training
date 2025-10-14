import { uid } from "./utils";

/**
 * mockUpload(file, onProgress, signal)
 * - 800~2000ms 소요, 10~30% 확률로 실패
 * - 진행률 콜백 제공, AbortController.signal 지원
 */
export const mockUpload = (
  file: File,
  onProgress: (n: number) => void,
  signal?: AbortSignal
): Promise<{ id: string; url: string }> => {
  return new Promise((resolve, reject) => {
    const totalMs = 800 + Math.floor(Math.random() * 1200);
    const start = Date.now();

    let canceled = false;
    const onAbort = () => {
      canceled = true;
      clearInterval(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }

    const timer = setInterval(() => {
      if (canceled) return;
      const elapsed = Date.now() - start;
      const pct = Math.min(99, Math.floor((elapsed / totalMs) * 100));
      onProgress(pct);
      if (elapsed >= totalMs) {
        clearInterval(timer);
        // 실패 시뮬레이션 (10~30%)
        const fail = Math.random() < 0.1 + Math.random() * 0.2;
        if (fail) {
          reject(new Error("네트워크 오류가 발생했습니다."));
        } else {
          onProgress(100);
          resolve({ id: uid(), url: URL.createObjectURL(file) });
        }
      }
    }, 80);
  });
};
