/**
 * Enhanced file saving utility for mobile PWAs
 * Uses Web Share API for better mobile experience
 */

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

/**
 * Get MIME type based on file extension
 */
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

/**
 * Get file type description for save picker
 */
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

/**
 * Check if device is mobile
 * Uses user agent and screen size as signals
 */
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    );

  // Se a tela for maior que 1024px, tratamos como desktop (mesmo se o User Agent disser mobile, como no DevTools)
  if (window.innerWidth > 1024) return false;

  return isMobileUA;
}

/**
 * Check if Web Share API is available and supports files
 */
async function canShareFile(): Promise<boolean> {
  // Never use share on desktop - always use download
  if (isDesktopDevice()) {
    return false;
  }

  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  // Test if file sharing is supported
  try {
    const testFile = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Check if device is desktop
 */
function isDesktopDevice(): boolean {
  return !isMobileDevice();
}

/**
 * Save blob as file with platform-optimized handling
 *
 * 1. On desktop (Chrome/Edge/Opera): Uses native save dialog
 * 2. Fallback: Direct download via browser
 */
export async function saveBlobAsFile(
  blob: Blob,
  fileName: string,
  options?: {
    /** Force direct download without picker */
    forceDownload?: boolean;
    // Removidas opções de share
  }
): Promise<{ success: boolean; method: "save-picker" | "download" }> {
  const { forceDownload = false } = options || {};

  // 1. TENTAR SALVAR VIA NATIVE PICKER (Desktop Chrome/Edge/Opera)
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
    }
  }

  // 2. DOWNLOAD DIRETO (Fallback ou se forçado)
  return downloadBlobDirectly(blob, fileName);
}

/**
 * Direct download using anchor element
 */
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

/**
 * Show a toast/notification after file operation
 */
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
