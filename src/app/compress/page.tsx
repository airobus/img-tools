'use client'

import { useState } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface FileItem {
  id: string
  file: File
  preview: string
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
    const preview = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })

    return {
      id: Math.random().toString(36).slice(2),
      file,
      preview,
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

  const compressFile = async (fileItem: FileItem) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing' } : f
      ))

      // 提前检查文件是否需要压缩
      const skipCompression = await shouldSkipCompression(fileItem.file)
      if (skipCompression) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? {
            ...f,
            status: 'done',
            compressedFile: fileItem.file,
            compressedPreview: fileItem.preview,
            compressionRatio: 0,
            error: '当前图片已经足够小，无需压缩',
            progress: 100
          } : f
        ))
        return
      }

      const options = {
        ...compressionOptions,
        useWebWorker: true,
        fileType: fileItem.file.type,
        onProgress: (p: number) => {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: Math.min(Math.round(p * 100), 100) } : f
          ))
        },
      }

      const compressedFile = await imageCompression(fileItem.file, options)

      // 如果压缩后反而更大，使用原文件
      if (compressedFile.size >= fileItem.file.size) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? {
            ...f,
            status: 'done',
            compressedFile: fileItem.file,
            compressedPreview: fileItem.preview,
            compressionRatio: 0,
            error: '已经是最佳压缩状态，不可再压缩',
            progress: 100
          } : f
        ))
        return
      }

      const compressedPreview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(compressedFile)
      })

      const ratio = ((fileItem.file.size - compressedFile.size) / fileItem.file.size * 100).toFixed(1)

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'done',
          compressedFile,
          compressedPreview,
          compressionRatio: Number(ratio),
          progress: 100
        } : f
      ))
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'error',
          error: '压缩失败，请重试',
          progress: 0
        } : f
      ))
    }
  }

  const handleCompressAll = async () => {
    const waitingFiles = files.filter(f => f.status === 'waiting')
    
    // 分批处理文件
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

  // 添加文件预检查函数
  const shouldSkipCompression = async (file: File): Promise<boolean> => {
    // 1. 检查文件大小（比如小于50KB的文件直接跳过）
    const MIN_SIZE = 50 * 1024 // 50KB
    if (file.size < MIN_SIZE) {
      return true
    }

    // 2. 检查文件类型
    const isOptimizedFormat = file.type === 'image/webp' || file.type === 'image/avif'
    if (isOptimizedFormat) {
      // 对于已经是优化格式的图片，可以设置更大的阈值
      const OPTIMIZED_MIN_SIZE = 100 * 1024 // 100KB
      return file.size < OPTIMIZED_MIN_SIZE
    }

    // 3. 对于较大文件，可以快速检查是否已经被压缩过
    if (file.size > 1024 * 1024) { // 1MB以上的文件
      try {
        // 创建一个临时的 Image 对象来获取图片尺寸
        const dimensions = await getImageDimensions(file)
        const pixelCount = dimensions.width * dimensions.height
        const bitsPerPixel = (file.size * 8) / pixelCount

        // 如果每像素位数已经很低，说明图片已经被很好地压缩过
        if (bitsPerPixel < 2) { // 可以根据需要调整这个阈值
          return true
        }
      } catch (error) {
        console.error('检查图片尺寸失败:', error)
        return false
      }
    }

    return false
  }

  // 修改获取图片尺寸的辅助函数
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      // 使用 window.Image 来明确指定浏览器环境
      const img = new window.Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        })
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)

      // 清理 URL 对象
      return () => {
        URL.revokeObjectURL(img.src)
      }
    })
  }

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 标题区域 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-medium tracking-tight">批量图片压缩</h1>
          <p className="text-[var(--text-secondary)] text-xl">
            支持同时压缩多个图片，最多 {MAX_FILES} 个文件
          </p>
        </div>

        {/* 主要内容区 */}
        <div className="bg-white/80 rounded-3xl p-10 glass-effect">
          {/* 压缩选项 */}
          <div className="mb-8">
            <div className="space-y-4">
              {/* 预设按钮 */}
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

              {/* 质量滑块 */}
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

          {/* 上传区域 */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 
              ${isDragging ? 'border-[var(--accent-color)] bg-blue-50/50' : 'border-[var(--border)]'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
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
                  支持 JPG、PNG、WebP 格式，最多 {MAX_FILES} 个文件
                </p>
              </div>
            </label>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="mt-12 space-y-8">
              {/* 批量操作按钮 */}
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

              {/* 文件卡片列表 */}
              <div className="grid grid-cols-1 gap-6">
                {files.map(fileItem => (
                  <div 
                    key={fileItem.id}
                    className="modern-card p-6"
                  >
                    <div className="flex items-center gap-6">
                      {/* 预览图 */}
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image
                          src={fileItem.compressedPreview || fileItem.preview}
                          alt={fileItem.file.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* 文件信息 */}
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

                        {/* 状态和进度 */}
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
