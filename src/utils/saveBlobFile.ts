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

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    csv: "text/csv",
    json: "application/json",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

function getFileTypeConfig(fileName: string): {
  description: string;
  accept: Record<string, string[]>;
} {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return {
        description: "Arquivo PDF",
        accept: { "application/pdf": [".pdf"] },
      };
    case "xlsx":
      return {
        description: "Planilha Excel",
        accept: {
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
        },
      };
    case "xls":
      return {
        description: "Planilha Excel",
        accept: { "application/vnd.ms-excel": [".xls"] },
      };
    case "csv":
      return { description: "Arquivo CSV", accept: { "text/csv": [".csv"] } };
    default:
      return {
        description: "Arquivo",
        accept: { "application/octet-stream": [`.${ext}`] },
      };
  }
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    );

  if (window.innerWidth > 1024) return false;

  return isMobileUA;
}

async function canShareFile(): Promise<boolean> {
  if (isDesktopDevice()) {
    return false;
  }

  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    const testFile = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

function isDesktopDevice(): boolean {
  return !isMobileDevice();
}

export async function saveBlobAsFile(
  blob: Blob,
  fileName: string,
  options?: {
    forceDownload?: boolean;
    shareTitle?: string;
    shareText?: string;
  }
): Promise<{
  success: boolean;
  method: "share" | "save-picker" | "download";
}> {
  const { forceDownload = false, shareTitle, shareText } = options || {};

  if (isMobileDevice() && !forceDownload) {
    const canShare = await canShareFile();
    if (canShare && navigator.share) {
      try {
        const file = new File([blob], fileName, {
          type: getMimeType(fileName),
        });
        await navigator.share({
          files: [file],
          title: shareTitle || fileName,
          text: shareText || "",
        });
        return { success: true, method: "share" };
      } catch (err) {
        // Se o usuário cancelar ou houver erro, continuamos para download
        if ((err as Error).name !== "AbortError") {
          console.error("[saveBlobAsFile] Share failed:", err);
        } else {
          // Usuário cancelou o share
          return { success: false, method: "share" };
        }
      }
    }
  }

  // 2. TENTAR SALVAR VIA NATIVE PICKER (Desktop Chrome/Edge/Opera)
  const windowWithFS = window as WindowWithFileSystemAccess;
  if (windowWithFS.showSaveFilePicker && !forceDownload) {
    try {
      const handle = await windowWithFS.showSaveFilePicker({
        suggestedName: fileName,
        types: [getFileTypeConfig(fileName)],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { success: true, method: "save-picker" };
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return { success: false, method: "save-picker" };
      }
      console.error("[saveBlobAsFile] Picker failed:", err);
    }
  }

  // 3. DOWNLOAD DIRETO (Fallback ou se forçado)
  return downloadBlobDirectly(blob, fileName);
}

function downloadBlobDirectly(
  blob: Blob,
  fileName: string
): { success: boolean; method: "download" } {
  const blobUrl = URL.createObjectURL(blob);

  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = "none";

    // Ensure the element is in the DOM before clicking
    document.body.appendChild(a);

    // Use a small timeout to ensure browser processes the appendChild
    setTimeout(() => {
      a.click();

      // Cleanup after download starts
      setTimeout(() => {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(blobUrl);
      }, 200);
    }, 0);

    return { success: true, method: "download" };
  } catch (error) {
    console.error("[saveBlobAsFile] Download failed:", error);

    // Last resort: open in new tab
    try {
      window.open(blobUrl, "_blank");
      return { success: true, method: "download" };
    } catch {
      URL.revokeObjectURL(blobUrl);
      return { success: false, method: "download" };
    }
  }
}

export function showFileNotification(
  method: "save-picker" | "download",
  fileName: string,
  success: boolean
): void {
  // This can be integrated with your toast/notification system
  if (!success) {
    console.log("📄 Operação cancelada pelo usuário");
    return;
  }

  switch (method) {
    case "save-picker":
      console.log(`💾 ${fileName} salvo com sucesso!`);
      break;
    case "download":
      console.log(`⬇️ ${fileName} baixado! Verifique a pasta Downloads.`);
      break;
  }
}
