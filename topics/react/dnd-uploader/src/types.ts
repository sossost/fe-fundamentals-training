export type UploadStatus =
  | "idle"
  | "queued"
  | "uploading"
  | "success"
  | "error"
  | "canceled";

export type Item = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  serverUrl?: string;
  abortCtrl?: AbortController;
};
