import { File, IFileServiceOptions, IStorageOptions } from './file.interface';
export declare class FileService {
    private $storage;
    constructor({ storage, bucket, ...options }: IFileServiceOptions);
    download(key: string): Promise<import("./file.interface").TDownloadedFile | null>;
    upload(file: File): Promise<{
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
    delete(key: string): Promise<import("./file.interface").IResponse | undefined>;
    private validateExtension;
    private validateSize;
    private getFileUrl;
    private generateFileName;
    get options(): IStorageOptions;
    private $options;
}
