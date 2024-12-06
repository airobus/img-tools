'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Footer from '@/components/Footer'

interface ImageFile {
  id: string
  file: File
  preview: string
  width: number
  height: number
  rotation: number
  resizedFile?: File
  resizedPreview?: string
}

export default function ResizePage() {
  const [image, setImage] = useState<ImageFile | null>(null)
  const [newWidth, setNewWidth] = useState<number>(0)
  const [newHeight, setNewHeight] = useState<number>(0)
  const [keepAspectRatio, setKeepAspectRatio] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await loadImage(file)
    }
  }

  const loadImage = async (file: File) => {
    try {
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      // 获取图片原始尺寸
      const dimensions = await getImageDimensions(file)
      
      setImage({
        id: Math.random().toString(36).slice(2),
        file,
        preview,
        width: dimensions.width,
        height: dimensions.height,
        rotation: 0
      })

      setNewWidth(dimensions.width)
      setNewHeight(dimensions.height)
      setError('')
    } catch (error) {
      console.error('加载图片失败:', error)
      setError('加载图片失败，请重试')
    }
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
    })
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = Number(e.target.value.replace(/^0+/, '')) || 0
    setNewWidth(width)
    if (keepAspectRatio && image) {
      const ratio = image.height / image.width
      setNewHeight(Math.round(width * ratio))
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = Number(e.target.value.replace(/^0+/, '')) || 0
    setNewHeight(height)
    if (keepAspectRatio && image) {
      const ratio = image.width / image.height
      setNewWidth(Math.round(height * ratio))
    }
  }

  const handleRotate = (direction: 'left' | 'right') => {
    if (!image) return
    
    const newRotation = image.rotation + (direction === 'left' ? -90 : 90)
    setImage(prev => prev ? {
      ...prev,
      rotation: newRotation
    } : null)
  }

  const handleResize = async () => {
    if (!image || !canvasRef.current) return

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法创建canvas上下文')

      // 设置canvas尺寸
      canvas.width = newWidth
      canvas.height = newHeight

      // 创建临时图片
      const img = new window.Image()
      img.src = image.preview

      await new Promise<void>((resolve) => {
        img.onload = () => {
          // 处理旋转
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((image.rotation * Math.PI) / 180)
          
          // 根据旋转角度调整绘制位置
          const isVertical = Math.abs(image.rotation % 180) === 90
          const drawWidth = isVertical ? newHeight : newWidth
          const drawHeight = isVertical ? newWidth : newHeight
          
          ctx.drawImage(
            img,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
          )
          
          ctx.restore()
          resolve()
        }
      })

      // 转换为Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, image.file.type)
      })

      // 创建新文件
      const resizedFile = new File([blob], image.file.name, {
        type: image.file.type
      })

      // 创建预览URL
      const resizedPreview = URL.createObjectURL(blob)

      // 更新状态
      setImage(prev => prev ? {
        ...prev,
        resizedFile,
        resizedPreview
      } : null)

      setError('')
    } catch (error) {
      console.error('调整大小失败:', error)
      setError('调整大小失败，请重试')
    }
  }

  const handleDownload = () => {
    if (!image?.resizedFile) return
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(image.resizedFile)
    link.download = `resized-${image.file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    const file = e.dataTransfer.files[0]
    if (file) {
      await loadImage(file)
    }
  }

  const handleResetDimensions = () => {
    if (image) {
      const isVertical = Math.abs(image.rotation % 180) === 90
      if (isVertical) {
        setNewWidth(image.height)
        setNewHeight(image.width)
      } else {
        setNewWidth(image.width)
        setNewHeight(image.height)
      }
    }
  }

  return (
    <>
      <div className="min-h-screen p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight">调整图片尺寸</h1>
            <p className="text-[var(--text-secondary)] text-xl">
              轻松调整图片大小，保持或自定义宽高比例
            </p>
          </div>

          <div className="space-y-8">
            {/* 上传区域 */}
            {!image && (
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
                      支持 JPG、PNG、WebP 等常见图片格式
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* 调整区域 */}
            {image && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* 控制面板 */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium">调整尺寸</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium text-[var(--text-secondary)]">
                            宽度 (px)
                          </label>
                          <input
                            type="number"
                            value={String(newWidth).replace(/^0+/, '') || '0'}
                            onChange={handleWidthChange}
                            min="1"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium text-[var(--text-secondary)]">
                            高度 (px)
                          </label>
                          <input
                            type="number"
                            value={String(newHeight).replace(/^0+/, '') || '0'}
                            onChange={handleHeightChange}
                            min="1"
                            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="aspectRatio"
                          checked={keepAspectRatio}
                          onChange={(e) => setKeepAspectRatio(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="aspectRatio"
                          className="text-sm text-[var(--text-secondary)]"
                        >
                          保持宽高比
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleRotate('left')}
                        className="btn-secondary"
                        title="向左旋转90度"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRotate('right')}
                        className="btn-secondary"
                        title="向右旋转90度"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                      <button
                        onClick={handleResize}
                        className="btn-primary"
                      >
                        调整大小
                      </button>
                      {image.resizedFile && (
                        <button
                          onClick={handleDownload}
                          className="btn-primary"
                        >
                          下载
                        </button>
                      )}
                      <button
                        onClick={handleResetDimensions}
                        className="btn-secondary"
                        title="重置为原始尺寸"
                      >
                        重置尺寸
                      </button>
                      <button
                        onClick={() => setImage(null)}
                        className="btn-secondary"
                      >
                        重新选择
                      </button>
                    </div>

                    {error && (
                      <p className="text-sm text-red-500">{error}</p>
                    )}
                  </div>

                  <div className="text-sm text-[var(--text-secondary)]">
                    <p>原始尺寸: {image.width} x {image.height} 像素</p>
                    {image.resizedFile && (
                      <p className="mt-1">调整后: {newWidth} x {newHeight} 像素</p>
                    )}
                  </div>
                </div>

                {/* 预览区域 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-medium">预览</h2>
                  <div className="relative w-full h-[500px] rounded-xl border border-[var(--border)] bg-[#f8f9fa] overflow-hidden">
                    <Image
                      src={image.resizedPreview || image.preview}
                      alt="预览图"
                      fill
                      className="object-contain transition-transform duration-300"
                      style={{ transform: `rotate(${image.rotation}deg)` }}
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 隐藏的Canvas用于处理图片 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <Footer />
    </>
  )
} 