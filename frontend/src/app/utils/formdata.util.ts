

export function buildFormDataFromObject(obj: Record<string, any>): FormData {
  const fd = new FormData();

  Object.entries(obj ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

 
    fd.append(key, value.toString());
  });

  return fd;
}

export function appendFiles(fd: FormData, fieldName: string, files: File[]) {
  (files ?? []).forEach((file) => fd.append(fieldName, file));
}
