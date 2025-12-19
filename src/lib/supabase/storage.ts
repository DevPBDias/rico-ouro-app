import { getSupabase } from "./client";

const BUCKET_NAME = "animal_semen";

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param doseId - The dose ID to use as filename
 * @returns The public URL of the uploaded image
 */
export async function uploadDoseImage(
  file: File,
  doseId: string
): Promise<UploadImageResult> {
  try {
    const supabase = getSupabase();

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${doseId}-${Date.now()}.${fileExt}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("❌ [Storage] Upload failed:", error);
      return { success: false, error: error.message };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    console.log("✅ [Storage] Image uploaded:", publicUrl);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("❌ [Storage] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteDoseImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = getSupabase();

    // Extract the file path from the URL
    const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      console.warn("[Storage] Could not extract file path from URL");
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("❌ [Storage] Delete failed:", error);
      return false;
    }

    console.log("✅ [Storage] Image deleted:", filePath);
    return true;
  } catch (err) {
    console.error("❌ [Storage] Unexpected error:", err);
    return false;
  }
}

/**
 * Compress and resize an image before upload
 * @param file - The original file
 * @param maxWidth - Maximum width (default 800px)
 * @param quality - JPEG quality (default 0.8)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
