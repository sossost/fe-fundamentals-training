export const uid = () => Math.random().toString(36).slice(2, 10);

export const isDuplicate = (a: File, b: File) => {
  return (
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
  );
};

export const validateFile = (file: File): string | null => {
  if (!ACCEPT.includes(file.type))
    return `허용되지 않는 형식(${file.type || "unknown"})`;
  if (file.size > MAX_SIZE_BYTES)
    return `파일 용량 초과(${(file.size / (1024 * 1024)).toFixed(2)}MB)`;
  return null;
};
