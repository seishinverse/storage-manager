import { randomBytes } from "crypto"
import { extname } from 'path'
import { BANNED_FOR_FILE_EXT, FILE_IS_TOO_BIG, FILE_IS_TOO_SMALL } from "./file.constants"
import { File, FileStorage, IFileServiceOptions, IStorageOptions } from './file.interface'

export class FileService {
  private $storage: FileStorage

  constructor({ storage, bucket, ...options }: IFileServiceOptions) {
    this.$options = options
    this.$storage = storage
    this.$storage.bucket = bucket
  }
  async download(key: string) {
    try {
      return await this.$storage.download(key)
    } catch (error) {
      return null
    }
  }

  async upload(file: File) {
    try {
      if (this.options?.limits?.extensions !== '*') this.validateExtension(file.originalname)
      if (this.options?.limits?.size) this.validateSize(file.size)

      const { key, url } = await this.$storage.upload({
        ...file,
        originalname: this.generateFileName(file.originalname)
      })

      return {
        success: true,
        ...(this.options.include.key && { key }),
        ...(this.options.include.url && { url: url || await this.getFileUrl(key) })
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return {
          success: false,
          error: {
            message: error.message
          }
        }
      }
    }
  }

  async delete(key: string) {
    try {
      return await this.$storage.delete(key)
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return {
          success: false,
          error: {
            message: error.message
          }
        }
      }
    }
  }

  private validateExtension(fileName: string) {
    if (!this.options.limits?.extensions || this.options.limits?.extensions === '*') return
    const { exclude, include } = this.options.limits.extensions
    const ext = extname(fileName)

    if (exclude?.length && exclude.includes(ext)) throw new Error(BANNED_FOR_FILE_EXT)
    if (include?.length && !include.includes(ext)) throw new Error(BANNED_FOR_FILE_EXT)
  }

  private validateSize(fileSize: number) {
    const { limits } = this.options

    if (typeof limits?.size === 'number' && fileSize > limits.size * 1000) throw new Error(FILE_IS_TOO_BIG)
    else if (typeof limits?.size === 'object') {
      if (fileSize > limits.size.max * 1000) throw new Error(FILE_IS_TOO_BIG)
      if (fileSize < limits.size.min * 1000) throw new Error(FILE_IS_TOO_SMALL)
    }
  }

  private async getFileUrl(key: string) {
    try {
      if (!this.$storage.getUrl) return ''
      return await this.$storage.getUrl(key)
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return {
          success: false,
          error: {
            message: error.message
          }
        }
      }
    }
  }

  private generateFileName(fileName: string) {
    const { naming } = this.options

    if (!naming || naming.default && !naming.random) return fileName

    const ext = extname(fileName)

    if (naming.random) {
      return randomBytes(9).toString('hex') + ext
    }

    const originalName = naming.baseName
      ? fileName.slice(0, fileName.lastIndexOf('.'))
      : ''

    const uniqueIdentifier = naming.date
      ? Date.now()
      : randomBytes(9).toString('hex')

    const baseName = originalName.length
      ? originalName + '_' + uniqueIdentifier
      : uniqueIdentifier

    return `${naming.prefix || ''}${baseName}${naming.postfix || ''}${ext}`
  }

  get options() {
    return this.$options
  }

  private $options: IStorageOptions
}
