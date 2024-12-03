'use client'

import { useState } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Buffer } from 'buffer'

if (typeof window !== 'undefined') {
  window.Buffer = Buffer
}

interface FileItem {
  id: string
  file: File
  preview: string
  type: 'image' | 'heic'
  compressedFile?: File
  compressedPreview?: string
  status: 'waiting' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
  compressionRatio?: number
}

const MAX_FILES = 50
const CONCURRENT_LIMIT = 5
const defaultCompressionOptions = {
  small: {
    quality: 0.5,
  },
  medium: {
    quality: 0.7,
  },
  high: {
    quality: 0.9,
  }
}

// 添加默认视频缩略图 URL
const DEFAULT_VIDEO_THUMBNAIL = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <rect width="100%" height="100%" fill="#f1f5f9"/>
    <path d="M120 90v20l20-10-20-10zM150 100c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50z" fill="#94a3b8"/>
  </svg>
`)}`

export default function CompressPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [compressionOptions, setCompressionOptions] = useState({
    quality: 0.7,
    maxSizeMB: 10,
    maxWidthOrHeight: 4096
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const createFileItem = async (file: File): Promise<FileItem> => {
    let previewFile = file
    let fileType = getFileType(file)
    
    // 如果是 HEIC 文件，先转换为 JPEG 用于预览
    if (fileType === 'heic') {
      try {
        previewFile = await convertHeicToJpeg(file)
      } catch (error) {
        console.error('HEIC preview conversion failed:', error)
      }
    }

    const preview = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(previewFile)
    })

    return {
      id: Math.random().toString(36).slice(2),
      file,
      preview,
      type: fileType,
      status: 'waiting',
      progress: 0
    }
  }

  const handleFiles = async (newFiles: FileList | File[]) => {
    if (files.length >= MAX_FILES) {
      alert(`为保证处理质量，一次最多只能添加 ${MAX_FILES} 个文件`)
      return
    }

    const remainingSlots = MAX_FILES - files.length
    const filesToAdd = Array.from(newFiles).slice(0, remainingSlots)
    
    if (newFiles.length > remainingSlots) {
      alert(`已达到文件数量上限，只添加了前 ${remainingSlots} 个文件`)
    }
    
    const newFileItems = await Promise.all(
      filesToAdd.map(file => createFileItem(file))
    )

    setFiles(prev => [...prev, ...newFileItems])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files
    if (newFiles) {
      handleFiles(newFiles)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const newFiles = e.dataTransfer.files
    handleFiles(newFiles)
  }

  const getFileType = (file: File): 'image' | 'heic' => {
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) return 'heic'
    return 'image'
  }

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const heicConvert = (await import('heic-convert')).default
    const arrayBuffer = await file.arrayBuffer()
    const jpegBuffer = await heicConvert({
      buffer: Buffer.from(arrayBuffer),
      format: 'JPEG',
      quality: 0.9
    })
    return new File([jpegBuffer], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg'
    })
  }

  const compressFile = async (fileItem: FileItem) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing' } : f
      ))

      let processedFile: File
      let shouldCompress = true

      if (fileItem.type === 'heic') {
        try {
          processedFile = await convertHeicToJpeg(fileItem.file)
        } catch (error) {
          throw new Error('HEIC 转换失败: ' + (error as Error).message)
        }
      } else {
        processedFile = fileItem.file
      }

      if (shouldCompress) {
        const skipCompression = await shouldSkipCompression(processedFile)
        if (skipCompression) {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? {
              ...f,
              status: 'done',
              compressedFile: processedFile,
              compressedPreview: fileItem.preview,
              compressionRatio: 0,
              error: '已经是最佳压缩状态，不可再压缩',
              progress: 100
            } : f
          ))
          return
        }

        const options = {
          ...compressionOptions,
          useWebWorker: true,
          fileType: processedFile.type,
          onProgress: (p: number) => {
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, progress: Math.min(Math.round(p * 100), 100) } : f
            ))
          },
        }

        processedFile = await imageCompression(processedFile, options)
      }

      const preview = await generateImagePreview(processedFile)
      const ratio = ((fileItem.file.size - processedFile.size) / fileItem.file.size * 100).toFixed(1)

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'done',
          compressedFile: processedFile,
          compressedPreview: preview,
          compressionRatio: Number(ratio),
          progress: 100
        } : f
      ))
    } catch (error) {
      console.error('压缩失败:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'error',
          error: error instanceof Error ? error.message : '处理失败，请重试',
          progress: 0
        } : f
      ))
    }
  }

  const generateImagePreview = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleCompressAll = async () => {
    const waitingFiles = files.filter(f => f.status === 'waiting')
    
    for (let i = 0; i < waitingFiles.length; i += CONCURRENT_LIMIT) {
      const batch = waitingFiles.slice(i, i + CONCURRENT_LIMIT)
      await Promise.all(batch.map(file => compressFile(file)))
    }
  }

  const handleDownload = (fileItem: FileItem) => {
    if (!fileItem.compressedFile) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(fileItem.compressedFile)
    link.download = `compressed-${fileItem.file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleBatchDownload = async () => {
    const compressedFiles = files.filter(f => 
      f.status === 'done' && f.compressedFile
    )
    
    if (compressedFiles.length === 0) {
      alert('没有可下载的文件')
      return
    }

    setIsDownloading(true)
    try {
      const zip = new JSZip()
      
      const folder = zip.folder('compressed-images')
      if (!folder) throw new Error('Failed to create folder')

      compressedFiles.forEach(fileItem => {
        if (fileItem.compressedFile) {
          const prefix = fileItem.compressionRatio && fileItem.compressionRatio > 0 
            ? 'compressed-' 
            : 'original-'
          folder.file(`${prefix}${fileItem.compressedFile.name}`, fileItem.compressedFile)
        }
      })

      const content = await zip.generateAsync({ type: 'blob' })
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(content, `image-tools-${timestamp}.zip`)
    } catch (error) {
      console.error('打包下载失败:', error)
      alert('打包下载失败，请重试')
    } finally {
      setIsDownloading(false)
    }
  }

  const shouldSkipCompression = async (file: File): Promise<boolean> => {
    const MIN_SIZE = 50 * 1024
    if (file.size < MIN_SIZE) {
      return true
    }

    const isOptimizedFormat = file.type === 'image/webp' || file.type === 'image/avif'
    if (isOptimizedFormat) {
      const OPTIMIZED_MIN_SIZE = 100 * 1024
      return file.size < OPTIMIZED_MIN_SIZE
    }

    if (file.size > 1024 * 1024) {
      try {
        const dimensions = await getImageDimensions(file)
        const pixelCount = dimensions.width * dimensions.height
        const bitsPerPixel = (file.size * 8) / pixelCount

        if (bitsPerPixel < 2) {
          return true
        }
      } catch (error) {
        console.error('检查图片尺寸失败:', error)
        return false
      }
    }

    return false
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        })
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)

      return () => {
        URL.revokeObjectURL(img.src)
      }
    })
  }

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-medium tracking-tight">批量图片压缩</h1>
          <p className="text-[var(--text-secondary)] text-xl">
            支持同时压缩多个图片，最多 {MAX_FILES} 个文件
          </p>
        </div>

        <div className="bg-white/80 rounded-3xl p-10 glass-effect">
          <div className="mb-8">
            <div className="space-y-4">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setCompressionOptions(prev => ({ ...prev, quality: defaultCompressionOptions.small.quality }))}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
                >
                  低质量 (小文件)
                </button>
                <button
                  onClick={() => setCompressionOptions(prev => ({ ...prev, quality: defaultCompressionOptions.medium.quality }))}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
                >
                  中等质量
                </button>
                <button
                  onClick={() => setCompressionOptions(prev => ({ ...prev, quality: defaultCompressionOptions.high.quality }))}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
                >
                  高质量 (大文件)
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    压缩质量
                  </label>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {Math.round(compressionOptions.quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  value={compressionOptions.quality}
                  onChange={(e) => setCompressionOptions(prev => ({
                    ...prev,
                    quality: Number(e.target.value)
                  }))}
                  className="w-full"
                  min="0.1"
                  max="1"
                  step="0.1"
                />
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>高压缩</span>
                  <span>高质量</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 
              ${isDragging ? 'border-[var(--accent-color)] bg-blue-50/50' : 'border-[var(--border)]'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*,.heic"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
              multiple
              max={MAX_FILES}
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer inline-flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--accent-color)]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--accent-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-[var(--text-primary)]">
                  点击或拖放图片至此处
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  支持 JPG、PNG、WebP、HEIC 格式，最多 {MAX_FILES} 个文件
                </p>
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-12 space-y-8">
              <div className="flex gap-4">
                <button
                  onClick={handleCompressAll}
                  className="btn-primary"
                  disabled={!files.some(f => f.status === 'waiting')}
                >
                  压缩全部
                </button>
                <button
                  onClick={handleBatchDownload}
                  className="btn-primary"
                  disabled={isDownloading || !files.some(f => 
                    f.status === 'done' && f.compressedFile
                  )}
                >
                  {isDownloading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      打包中...
                    </span>
                  ) : (
                    <>打包下载</>
                  )}
                </button>
                <button
                  onClick={() => setFiles([])}
                  className="btn-secondary"
                >
                  清空列表
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {files.map(fileItem => (
                  <div 
                    key={fileItem.id}
                    className="modern-card p-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image
                          src={fileItem.compressedPreview || fileItem.preview}
                          alt={fileItem.file.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium truncate">
                              {fileItem.file.name}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                              {formatFileSize(fileItem.file.size)}
                              {fileItem.compressedFile && fileItem.status === 'done' && (
                                <span className="ml-2">
                                  → {formatFileSize(fileItem.compressedFile.size)}
                                  {fileItem.compressionRatio !== undefined && fileItem.compressionRatio > 0 && (
                                    <span className="ml-2 text-green-500">
                                      (-{fileItem.compressionRatio}%)
                                    </span>
                                  )}
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(fileItem.id)}
                            className="text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-4">
                          {fileItem.status === 'processing' && (
                            <div className="space-y-2">
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[var(--accent-color)] transition-all duration-300"
                                  style={{ width: `${fileItem.progress}%` }}
                                />
                              </div>
                              <div className="text-sm text-[var(--text-secondary)]">
                                压缩中 {fileItem.progress}%
                              </div>
                            </div>
                          )}
                          {fileItem.status === 'done' && (
                            <div className="flex items-center justify-between">
                              {fileItem.compressionRatio !== undefined && fileItem.compressionRatio > 0 ? (
                                <button
                                  onClick={() => handleDownload(fileItem)}
                                  className="text-sm text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors"
                                >
                                  下载压缩后的图片
                                </button>
                              ) : (
                                <div className="text-sm text-orange-500">
                                  {fileItem.error || '已经是最佳压缩状态，不可再压缩'}
                                </div>
                              )}
                            </div>
                          )}
                          {fileItem.status === 'error' && (
                            <div className="text-sm text-red-500">
                              {fileItem.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
