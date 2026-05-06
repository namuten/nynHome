export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface UploadedFileInfo {
  fileUrl: string;
  mimeType: string;
  fileCategory: FileCategory;
  fileName: string;
  fileSize: number;
  postId?: number;
}
