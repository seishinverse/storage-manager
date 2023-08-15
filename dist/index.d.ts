/// <reference types="node" />

import { Readable } from 'stream';

export declare const APPWRITE_STORAGE = "APPWRITE_STORAGE";

export declare const AZURE_STORAGE = "AZURE_STORAGE";

export declare const BANNED_FOR_FILE_EXT = "File extension is not allowed";

export declare const BANNED_FOR_FILE_LIMIT = "You have got limit of loaded files, please wait 10 minutes to load more";

declare type File_2 = IFile | TDownloadedFile;
export { File_2 as File }

export declare const FILE_IS_TOO_BIG = "File size is too big";

export declare const FILE_IS_TOO_SMALL = "File size is too small";

export declare class FileService {
    private $storage;
    constructor({ storage, bucket, ...options }: IFileServiceOptions);
    download(key: string): Promise<TDownloadedFile | null>;
    upload(file: File_2): Promise<{
        url?: string | {
            success: boolean;
            error: {
                message: string;
            };
        } | undefined;
        key?: string | undefined;
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: {
            message: string;
        };
    } | undefined>;
    delete(key: string): Promise<IResponse | undefined>;
    private validateExtension;
    private validateSize;
    private getFileUrl;
    private generateFileName;
    get options(): IStorageOptions;
    private $options;
}

export declare abstract class FileStorage {
    abstract upload(file: File_2): Promise<IUploadResponse>;
    abstract delete(key: string): Promise<IResponse>;
    abstract download(key: string): Promise<File_2>;
    abstract getUrl?(key: string): Promise<string | undefined>;
    abstract get bucket(): string;
    abstract set bucket(value: string);
}

export declare const FIREBASE_STORAGE = "FIREBASE_STORAGE";

export declare interface IFile {
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

export declare interface IFileServiceOptions extends IStorageOptions {
    storage: FileStorage;
    bucket: string;
}

export declare interface IResponse {
    url?: string;
    key?: string;
    success: boolean;
    error?: {
        message: string;
    };
}

export declare interface IStorageOptions {
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

export declare interface IUploadResponse extends IResponse {
    key: string;
}

export declare const LOCAL_STORAGE = "LOCAL_STORAGE";

export declare const S3_STORAGE = "S3_STORAGE";

export declare const SETTER_BUCKET_WRONG_VALUE = "You have entered wrong bucket name, it must be string and not empty";

export declare const SUPABASE_STORAGE = "SUPABASE_STORAGE";

export declare type TDownloadedFile = Pick<IFile, 'buffer' | 'size' | 'mimetype' | 'originalname'>;

export declare type TFileNamePatterns = string | number | Date;

export { }
