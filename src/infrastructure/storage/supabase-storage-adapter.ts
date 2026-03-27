import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { IStorage } from "@/domain/ports/i-storage";

const BUCKET = "watch-images";

export class SupabaseStorageAdapter implements IStorage {
  private readonly supabase: SupabaseClient;
  private readonly supabaseUrl: string;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  async uploadWatchImage(
    imageBase64: string,
    watchId: string,
    mimeType = "image/jpeg",
  ): Promise<{ url: string; storagePath: string }> {
    const ext = mimeType === "image/png" ? "png" : "jpg";
    const storagePath = `${watchId}/${Date.now()}.${ext}`;

    const buffer = Buffer.from(imageBase64, "base64");

    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const url = this.getPublicUrl(storagePath);
    return { url, storagePath };
  }

  async deleteWatchImage(storagePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  getPublicUrl(storagePath: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  }
}
