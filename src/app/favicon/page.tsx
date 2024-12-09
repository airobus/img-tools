'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Footer from '@/components/Footer'

export default function FaviconGrabPage() {
  const [url, setUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [error, setError] = useState('')
  const [size, setSize] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [fileExtension, setFileExtension] = useState('png')
  const imageRef = useRef<HTMLImageElement>(null)

  const isValidUrl = (urlString: string) => {
    const formattedUrl = urlString.includes('://') 
      ? urlString 
      : `https://${urlString}`

    try {
      const url = new URL(formattedUrl)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleGrabFavicon = async () => {
    if (!url) {
      setError('请输入网址')
      return
    }

    const formattedUrl = url.includes('://') 
      ? url 
      : `https://${url}`

    if (!isValidUrl(formattedUrl)) {
      setError('请输入有效的网址（如 example.com 或 https://example.com）')
      return
    }

    setIsLoading(true)
    setError('')
    setFaviconUrl('')
    setFileExtension('png')

    try {
      const response = await fetch('/api/grab-favicon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: formattedUrl,
          size: size || ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || '获取网站图标失败')
        return
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      const mimeType = blob.type
      const ext = mimeType.split('/')[1] || 'png'
      setFileExtension(ext)

      const img = new window.Image()
      img.onload = () => {
        setFaviconUrl(objectUrl)
      }
      img.onerror = () => {
        console.error('图像加载失败')
        setError('图标加载失败')
        URL.revokeObjectURL(objectUrl)
      }
      img.src = objectUrl

    } catch (err) {
      console.error('获取 favicon 失败:', err)
      setError('获取网站图标失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!faviconUrl) return

    const link = document.createElement('a')
    link.href = faviconUrl
    link.download = `favicon-${size}x${size}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="min-h-screen p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight">网站图标抓取</h1>
            <p className="text-[var(--text-secondary)] text-xl">
              轻松获取任意网站的 Favicon 图标
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              {/* 输入区域 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    网址
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.example.com"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    图标尺寸
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="0">默认尺寸</option>
                    <option value="16">16x16 像素</option>
                    <option value="32">32x32 像素</option>
                    <option value="48">48x48 像素</option>
                    <option value="64">64x64 像素</option>
                    <option value="128">128x128 像素</option>
                  </select>
                </div>

                <button
                  onClick={handleGrabFavicon}
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? '获取中...' : '获取 Favicon'}
                </button>

                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>

              {/* 预览区域 */}
              <div className="space-y-4">
                <h2 className="text-xl font-medium">预览</h2>
                <div 
                  className="w-full h-[400px] rounded-xl border border-[var(--border)] bg-[#f8f9fa] 
                    flex items-center justify-center p-4"
                >
                  {faviconUrl ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Image
                        ref={imageRef}
                        src={faviconUrl}
                        alt="Favicon"
                        width={size || 32}
                        height={size || 32}
                        className="object-contain"
                        priority
                        onError={() => {
                          console.error('Image load error')
                          setError('图标加载失败')
                        }}
                      />
                      <button
                        onClick={handleDownload}
                        className="btn-primary"
                      >
                        下载图标
                      </button>
                    </div>
                  ) : (
                    <p className="text-[var(--text-secondary)]">
                      {isLoading ? '正在获取图标...' : '图标将在此处显示'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 