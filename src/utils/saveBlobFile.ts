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
 */
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if Web Share API is available and supports files
 */
async function canShareFile(): Promise<boolean> {
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
 * Save blob as file with mobile-friendly sharing options
 *
 * On mobile: Uses Web Share API (native share sheet)
 * On desktop with File System Access: Uses native save dialog
 * Fallback: Direct download
 */
export async function saveBlobAsFile(
  blob: Blob,
  fileName: string,
  options?: {
    /** Show share dialog on mobile instead of direct download */
    preferShare?: boolean;
    /** Custom share title */
    shareTitle?: string;
    /** Custom share text */
    shareText?: string;
  }
): Promise<{ success: boolean; method: "share" | "save-picker" | "download" }> {
  const { preferShare = true, shareTitle, shareText } = options || {};

  // On mobile, prefer Web Share API for better UX
  if (isMobileDevice() && preferShare && (await canShareFile())) {
    try {
      const file = new File([blob], fileName, { type: getMimeType(fileName) });

      await navigator.share({
        title: shareTitle || `📄 ${fileName}`,
        text: shareText || "Relatório gerado pelo INDI Ouro",
        files: [file],
      });

      return { success: true, method: "share" };
    } catch (err) {
      // User cancelled or share failed, fall through to other methods
      if ((err as Error).name === "AbortError") {
        // User cancelled share dialog
        return { success: false, method: "share" };
      }
    }
  }

  // Try File System Access API (desktop Chrome)
  const windowWithFS = window as WindowWithFileSystemAccess;
  if (windowWithFS.showSaveFilePicker) {
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
      // User cancelled or not supported
      if ((err as Error).name === "AbortError") {
        return { success: false, method: "save-picker" };
      }
    }
  }

  // Fallback: Direct download
  const blobUrl = URL.createObjectURL(blob);

  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Cleanup after a short delay
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 100);

    return { success: true, method: "download" };
  } catch {
    // Last resort: open in new tab
    window.open(blobUrl, "_blank");
    return { success: true, method: "download" };
  }
}

/**
 * Show a toast/notification after file operation
 */
export function showFileNotification(
  method: "share" | "save-picker" | "download",
  fileName: string,
  success: boolean
): void {
  // This can be integrated with your toast/notification system
  if (!success) {
    console.log("📄 Operação cancelada pelo usuário");
    return;
  }

  switch (method) {
    case "share":
      console.log(`📤 ${fileName} compartilhado com sucesso!`);
      break;
    case "save-picker":
      console.log(`💾 ${fileName} salvo com sucesso!`);
      break;
    case "download":
      console.log(`⬇️ ${fileName} baixado! Verifique a pasta Downloads.`);
      break;
  }
}
