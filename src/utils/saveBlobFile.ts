interface WindowWithFileSystemAccess extends Window {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
}

export async function saveBlobAsFile(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);

  const windowWithFS = window as WindowWithFileSystemAccess;
  if (windowWithFS.showSaveFilePicker) {
    try {
      const handle = await windowWithFS.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          { description: "PDF Files", accept: { "application/pdf": [".pdf"] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      URL.revokeObjectURL(blobUrl);
      return;
    } catch (err) {
    }
  }

  try {
    const newTab = window.open(blobUrl, "_blank");
    if (!newTab) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
