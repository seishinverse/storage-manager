'use strict';

var crypto = require('crypto');
var path = require('path');

const SETTER_BUCKET_WRONG_VALUE = 'You have entered wrong bucket name, it must be string and not empty';
const BANNED_FOR_FILE_LIMIT = 'You have got limit of loaded files, please wait 10 minutes to load more';
const FILE_IS_TOO_SMALL = 'File size is too small';
const BANNED_FOR_FILE_EXT = 'File extension is not allowed';
const FILE_IS_TOO_BIG = 'File size is too big';
const S3_STORAGE = 'S3_STORAGE';
const FIREBASE_STORAGE = 'FIREBASE_STORAGE';
const LOCAL_STORAGE = 'LOCAL_STORAGE';
const AZURE_STORAGE = 'AZURE_STORAGE';
const APPWRITE_STORAGE = 'APPWRITE_STORAGE';
const SUPABASE_STORAGE = 'SUPABASE_STORAGE';

class FileStorage {
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class FileService {
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
        const ext = path.extname(fileName);
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
        const ext = path.extname(fileName);
        if (naming.random) {
            return crypto.randomBytes(9).toString('hex') + ext;
        }
        const originalName = naming.baseName
            ? fileName.slice(0, fileName.lastIndexOf('.'))
            : '';
        const uniqueIdentifier = naming.date
            ? Date.now()
            : crypto.randomBytes(9).toString('hex');
        const baseName = originalName.length
            ? originalName + '_' + uniqueIdentifier
            : uniqueIdentifier;
        return `${naming.prefix || ''}${baseName}${naming.postfix || ''}${ext}`;
    }
    get options() {
        return this.$options;
    }
}

exports.APPWRITE_STORAGE = APPWRITE_STORAGE;
exports.AZURE_STORAGE = AZURE_STORAGE;
exports.BANNED_FOR_FILE_EXT = BANNED_FOR_FILE_EXT;
exports.BANNED_FOR_FILE_LIMIT = BANNED_FOR_FILE_LIMIT;
exports.FILE_IS_TOO_BIG = FILE_IS_TOO_BIG;
exports.FILE_IS_TOO_SMALL = FILE_IS_TOO_SMALL;
exports.FIREBASE_STORAGE = FIREBASE_STORAGE;
exports.FileService = FileService;
exports.FileStorage = FileStorage;
exports.LOCAL_STORAGE = LOCAL_STORAGE;
exports.S3_STORAGE = S3_STORAGE;
exports.SETTER_BUCKET_WRONG_VALUE = SETTER_BUCKET_WRONG_VALUE;
exports.SUPABASE_STORAGE = SUPABASE_STORAGE;
