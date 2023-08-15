/// <reference types="node" />
/// <reference types="node" />
import { Readable } from 'stream';
export interface IFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    stream: Readable;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}
export type TDownloadedFile = Pick<IFile, 'buffer' | 'size' | 'mimetype' | 'originalname'>;
export type File = IFile | TDownloadedFile;
export interface IResponse {
    url?: string;
    key?: string;
    success: boolean;
    error?: {
        message: string;
    };
}
export interface IUploadResponse extends IResponse {
    key: string;
}
export type TFileNamePatterns = string | number | Date;
export interface IStorageOptions {
    limits?: {
        size?: number | {
            min: number;
            max: number;
        };
        extensions: {
            include?: string[];
            exclude?: string[];
        } | '*';
    };
    naming?: {
        prefix?: TFileNamePatterns;
        postfix?: TFileNamePatterns;
        baseName?: boolean;
        random?: boolean;
        date?: boolean;
        default?: boolean;
    };
    include: {
        url: boolean;
        key?: boolean;
    };
}
export interface IFileServiceOptions extends IStorageOptions {
    storage: FileStorage;
    bucket: string;
}
export declare abstract class FileStorage {
    abstract upload(file: File): Promise<IUploadResponse>;
    abstract delete(key: string): Promise<IResponse>;
    abstract download(key: string): Promise<File>;
    abstract getUrl?(key: string): Promise<string | undefined>;
    abstract get bucket(): string;
    abstract set bucket(value: string);
}
