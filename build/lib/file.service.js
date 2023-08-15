var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { randomBytes } from "crypto";
import { extname } from 'path';
import { BANNED_FOR_FILE_EXT, FILE_IS_TOO_BIG, FILE_IS_TOO_SMALL } from "./file.constants";
export class FileService {
    constructor(_a) {
        var { storage, bucket } = _a, options = __rest(_a, ["storage", "bucket"]);
        this.$options = options;
        this.$storage = storage;
        this.$storage.bucket = bucket;
    }
    download(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.$storage.download(key);
            }
            catch (error) {
                return null;
            }
        });
    }
    upload(file) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.limits) === null || _b === void 0 ? void 0 : _b.extensions) !== '*')
                    this.validateExtension(file.originalname);
                if ((_d = (_c = this.options) === null || _c === void 0 ? void 0 : _c.limits) === null || _d === void 0 ? void 0 : _d.size)
                    this.validateSize(file.size);
                const { key, url } = yield this.$storage.upload(Object.assign(Object.assign({}, file), { originalname: this.generateFileName(file.originalname) }));
                return Object.assign(Object.assign({ success: true }, (this.options.include.key && { key })), (this.options.include.url && { url: url || (yield this.getFileUrl(key)) }));
            }
            catch (error) {
                if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
                    return {
                        success: false,
                        error: {
                            message: error.message
                        }
                    };
                }
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.$storage.delete(key);
            }
            catch (error) {
                if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
                    return {
                        success: false,
                        error: {
                            message: error.message
                        }
                    };
                }
            }
        });
    }
    validateExtension(fileName) {
        var _a, _b;
        if (!((_a = this.options.limits) === null || _a === void 0 ? void 0 : _a.extensions) || ((_b = this.options.limits) === null || _b === void 0 ? void 0 : _b.extensions) === '*')
            return;
        const { exclude, include } = this.options.limits.extensions;
        const ext = extname(fileName);
        if ((exclude === null || exclude === void 0 ? void 0 : exclude.length) && exclude.includes(ext))
            throw new Error(BANNED_FOR_FILE_EXT);
        if ((include === null || include === void 0 ? void 0 : include.length) && !include.includes(ext))
            throw new Error(BANNED_FOR_FILE_EXT);
    }
    validateSize(fileSize) {
        const { limits } = this.options;
        if (typeof (limits === null || limits === void 0 ? void 0 : limits.size) === 'number' && fileSize > limits.size * 1000)
            throw new Error(FILE_IS_TOO_BIG);
        else if (typeof (limits === null || limits === void 0 ? void 0 : limits.size) === 'object') {
            if (fileSize > limits.size.max * 1000)
                throw new Error(FILE_IS_TOO_BIG);
            if (fileSize < limits.size.min * 1000)
                throw new Error(FILE_IS_TOO_SMALL);
        }
    }
    getFileUrl(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.$storage.getUrl)
                    return '';
                return yield this.$storage.getUrl(key);
            }
            catch (error) {
                if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
                    return {
                        success: false,
                        error: {
                            message: error.message
                        }
                    };
                }
            }
        });
    }
    generateFileName(fileName) {
        const { naming } = this.options;
        if (!naming || naming.default && !naming.random)
            return fileName;
        const ext = extname(fileName);
        if (naming.random) {
            return randomBytes(9).toString('hex') + ext;
        }
        const originalName = naming.baseName
            ? fileName.slice(0, fileName.lastIndexOf('.'))
            : '';
        const uniqueIdentifier = naming.date
            ? Date.now()
            : randomBytes(9).toString('hex');
        const baseName = originalName.length
            ? originalName + '_' + uniqueIdentifier
            : uniqueIdentifier;
        return `${naming.prefix || ''}${baseName}${naming.postfix || ''}${ext}`;
    }
    get options() {
        return this.$options;
    }
}
