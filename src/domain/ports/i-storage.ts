export interface IStorage {
  uploadWatchImage(
    imageBase64: string,
    watchId: string,
    mimeType?: string,
  ): Promise<{ url: string; storagePath: string }>;
  deleteWatchImage(storagePath: string): Promise<void>;
  getPublicUrl(storagePath: string): string;
}
