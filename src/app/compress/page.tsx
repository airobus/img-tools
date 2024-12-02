'use client'

import { useState } from 'react'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

export default function CompressPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compressionRatio, setCompressionRatio] = useState<number>(0)
  const [compressionOptions, setCompressionOptions] = useState({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    quality: 0.8
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setCompressedImage(null)
    setCompressedFile(null)
    setProgress(0)
    setCompressionRatio(0)
  }

  const handleCompress = async () => {
    if (!selectedFile) return
    setLoading(true)
    setProgress(0)

    try {
      const options = {
        ...compressionOptions,
        useWebWorker: true,
        fileType: selectedFile.type,
        onProgress: (p: number) => {
          setProgress(Math.round(p * 100))
        },
      }

      const compressedFile = await imageCompression(selectedFile, options)
      setCompressedFile(compressedFile)

      const ratio = ((selectedFile.size - compressedFile.size) / selectedFile.size * 100).toFixed(1)
      setCompressionRatio(Number(ratio))

      const reader = new FileReader()
      reader.onloadend = () => {
        setCompressedImage(reader.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('压缩失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!compressedFile) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(compressedFile)
    link.download = `compressed-${selectedFile?.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* 标题区域 */}
        <div className="space-y-4">
          <h1 className="text-4xl font-medium tracking-tight">图片压缩</h1>
          <p className="text-[var(--text-secondary)] text-xl">
            智能压缩算法，在保持图片质量的同时大幅减小文件体积
          </p>
        </div>

        {/* 主要内容区 */}
        <div className="bg-white/80 rounded-3xl p-10 glass-effect">
          {/* 压缩选项 */}
          <div className="mb-8 grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                最大文件大小 (MB)
              </label>
              <input
                type="number"
                value={compressionOptions.maxSizeMB}
                onChange={(e) => setCompressionOptions(prev => ({
                  ...prev,
                  maxSizeMB: Number(e.target.value)
                }))}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                最大尺寸 (像素)
              </label>
              <input
                type="number"
                value={compressionOptions.maxWidthOrHeight}
                onChange={(e) => setCompressionOptions(prev => ({
                  ...prev,
                  maxWidthOrHeight: Number(e.target.value)
                }))}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                min="100"
                max="4000"
                step="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                图片质量
              </label>
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
              <div className="text-sm text-[var(--text-secondary)]">
                {Math.round(compressionOptions.quality * 100)}%
              </div>
            </div>
          </div>

          {/* 上传区域 */}
          <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 
            ${preview ? 'border-[var(--border-color)]' : 'border-[var(--accent-color)] bg-blue-50/30'}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
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
                  选择图片或拖放至此处
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  支持 JPG、PNG、WebP 格式
                </p>
              </div>
            </label>
          </div>

          {/* 预览区域 */}
          {preview && (
            <div className="mt-12 space-y-8 animate-fade-in">
              {/* 进度条 */}
              {loading && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--accent-color)] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] text-center">
                    压缩进度: {progress}%
                  </div>
                </div>
              )}

              {/* 压缩比例显示 */}
              {compressionRatio > 0 && (
                <div className="text-center text-[var(--text-secondary)]">
                  压缩率: {compressionRatio}%
                  <span className="ml-2 text-sm">
                    ({formatFileSize(selectedFile?.size || 0)} → {formatFileSize(compressedFile?.size || 0)})
                  </span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">原图</h3>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {formatFileSize(selectedFile?.size || 0)}
                    </span>
                  </div>
                  <div className="relative h-[300px] w-full bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      alt="Original"
                      fill
                      style={{ objectFit: 'contain' }}
                      unoptimized
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">压缩后</h3>
                    {compressedFile && (
                      <span className="text-sm text-[var(--text-secondary)]">
                        {formatFileSize(compressedFile.size)}
                      </span>
                    )}
                  </div>
                  <div className="relative h-[300px] w-full bg-gray-50 rounded-lg overflow-hidden">
                    {compressedImage ? (
                      <Image
                        src={compressedImage}
                        alt="Compressed"
                        fill
                        style={{ objectFit: 'contain' }}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                        等待压缩...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  onClick={handleCompress}
                  disabled={loading}
                  className="flex-1 py-4 px-8 bg-[var(--accent-color)] text-white rounded-2xl 
                    hover:bg-[var(--accent-hover)] transition-colors disabled:bg-gray-200 
                    disabled:text-gray-400 font-medium"
                >
                  {loading ? '压缩中...' : '开始压缩'}
                </button>
                {compressedImage && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-4 px-8 bg-white border-2 border-[var(--accent-color)] 
                      text-[var(--accent-color)] rounded-2xl hover:bg-blue-50/50 
                      transition-colors font-medium"
                  >
                    下载压缩图片
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
