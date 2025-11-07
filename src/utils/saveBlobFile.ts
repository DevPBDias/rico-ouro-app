export async function saveBlobAsFile(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);

  // Tenta usar File System Access API
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
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
      console.warn("Erro ao salvar arquivo:", err);
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
