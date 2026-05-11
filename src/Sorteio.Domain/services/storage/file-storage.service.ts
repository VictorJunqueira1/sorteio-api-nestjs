export const FILE_STORAGE_SERVICE = Symbol('FILE_STORAGE_SERVICE');

export interface UploadFileInput {
    folder: string;
    originalName: string;
    mimeType: string;
    buffer: Buffer;
}

export interface UploadedFile {
    key: string;
    url: string;
}

export interface FileStorageService {
    upload(input: UploadFileInput): Promise<UploadedFile>;
}