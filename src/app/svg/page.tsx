'use client'

import { useState, useRef } from 'react'

export default function SvgEditorPage() {
  const [svgCode, setSvgCode] = useState<string>('')
  const [error, setError] = useState<string>('')
  const previewRef = useRef<HTMLDivElement>(null)

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const code = e.target.value
    setSvgCode(code)
    setError('')
    
    // 验证SVG代码
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(code, 'image/svg+xml')
      const errorNode = doc.querySelector('parsererror')
      if (errorNode) {
        setError('SVG代码格式错误')
      }
    } catch (err) {
      setError('SVG代码格式错误')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(svgCode)
  }

  const handleClear = () => {
    setSvgCode('')
    setError('')
  }

  const handleDownload = async (format: 'svg' | 'png' | 'jpg') => {
    if (!previewRef.current) return
    
    try {
      const svgElement = previewRef.current.querySelector('svg')
      if (!svgElement) throw new Error('未找到SVG元素')

      if (format === 'svg') {
        // 下载SVG
        const blob = new Blob([svgCode], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `image-tools-${Date.now()}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // 转换为Canvas并下载为PNG/JPG
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('无法创建canvas上下文')

        const svgData = new XMLSerializer().serializeToString(svgElement)
        const img = new Image()
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          
          const imgUrl = canvas.toDataURL(`image/${format}`)
          const link = document.createElement('a')
          link.href = imgUrl
          link.download = `image-tools-${Date.now()}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }

        img.src = url
      }
    } catch (err) {
      console.error('下载失败:', err)
      setError('下载失败,请检查SVG代码是否正确')
    }
  }

  return (
    <div className="min-h-screen p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-medium tracking-tight">SVG编辑器</h1>
          <p className="text-[var(--text-secondary)] text-xl">
            在线编辑和预览SVG图形,支持导出多种格式
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* 代码编辑区 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">SVG代码</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!svgCode}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  复制代码
                </button>
                <button
                  onClick={handleClear}
                  disabled={!svgCode}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  清除
                </button>
              </div>
            </div>
            <textarea
              value={svgCode}
              onChange={handleCodeChange}
              className="w-full h-[500px] p-4 font-mono text-sm rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              placeholder="在此输入SVG代码..."
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* 预览区 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">预览</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('svg')}
                  disabled={!svgCode || !!error}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  下载SVG
                </button>
                <button
                  onClick={() => handleDownload('png')}
                  disabled={!svgCode || !!error}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  下载PNG
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  disabled={!svgCode || !!error}
                  className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  下载JPG
                </button>
              </div>
            </div>
            <div 
              ref={previewRef}
              className="w-full h-[500px] rounded-xl border border-[var(--border)] bg-[#f8f9fa] flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 