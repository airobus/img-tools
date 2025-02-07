'use client'

import React, { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import html2canvas from 'html2canvas'
import Footer from '@/components/Footer'

// 预设卡片样式
const cardStyles = [
  {
    name: '简约白',
    background: '#ffffff',
    textColor: '#000000',
    fontSize: 16,
  },
  {
    name: '暖灰',
    background: '#f5f5f4',
    textColor: '#1f2937',
    fontSize: 16,
  },
  {
    name: '柔和',
    background: '#f0fdf4',
    textColor: '#065f46',
    fontSize: 16,
  },
]

// 修改卡片尺寸配置
const cardSizes = [
  {
    name: '小红书-封面竖版',
    width: 1242,
    height: 1660,
    description: '3:4 适合封面主图'
  },
  {
    name: '小红书-封面方形',
    width: 1080,
    height: 1080,
    description: '1:1 适合封面'
  },
  {
    name: '小红书-配图竖版',
    width: 900,
    height: 1200,
    description: '3:4 适合配图'
  },
  {
    name: '小红书-配图横版',
    width: 1200,
    height: 900,
    description: '4:3 适合配图'
  },
  {
    name: '抖音-竖版',
    width: 720,
    height: 1280,
    description: '9:16 适合抖音'
  },
  {
    name: '自适应',
    width: 'auto',
    height: 'auto',
    description: '根据内容自动调整'
  },
]

export default function MarkdownConverterPage() {
  const [markdown, setMarkdown] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [maxHeight, setMaxHeight] = useState(800) // 单个卡片最大高度
  const previewRef = useRef<HTMLDivElement>(null)
  const [selectedStyle, setSelectedStyle] = useState(cardStyles[2])
  const [selectedSize, setSelectedSize] = useState(cardSizes[2])
  const [padding, setPadding] = useState(32) // 默认 32px 内边距

  // 分割文本为多个卡片
  const splitIntoCards = (text: string): string[] => {
    // 如果是自适应尺寸，使用简单的字符数限制
    if (selectedSize.width === 'auto') {
      const maxChars = 500
      const cards: string[] = []
      let currentCard = ''
      
      const lines = text.split('\n')
      for (const line of lines) {
        if (currentCard.length + line.length > maxChars) {
          cards.push(currentCard.trim())
          currentCard = line
        } else {
          currentCard += (currentCard ? '\n' : '') + line
        }
      }
      if (currentCard) {
        cards.push(currentCard.trim())
      }
      return cards
    }

    // 计算每张卡片的可用高度（像素）
    const availableHeight = Number(selectedSize.height) / 2 - (padding * 2) - 60 // 减去padding和导出按钮的高度

    // 创建一个临时的测量容器
    const measureContainer = document.createElement('div')
    measureContainer.style.width = `${Number(selectedSize.width) / 2 - padding * 2}px`
    measureContainer.style.fontSize = `${fontSize}px`
    measureContainer.style.visibility = 'hidden'
    measureContainer.style.position = 'absolute'
    measureContainer.style.left = '-9999px'
    document.body.appendChild(measureContainer)

    const cards: string[] = []
    let currentCard = ''
    const lines = text.split('\n')

    for (const line of lines) {
      // 临时添加新行测量高度
      const testContent = currentCard + (currentCard ? '\n' : '') + line
      measureContainer.innerHTML = `<div class="markdown-content prose prose-sm">${testContent}</div>`
      
      if (measureContainer.offsetHeight > availableHeight && currentCard) {
        // 如果超出高度且当前卡片不为空，保存当前卡片
        cards.push(currentCard.trim())
        currentCard = line
      } else {
        // 如果没超出高度，或者当前卡片为空（即使超出也要放入至少一行），添加内容
        currentCard = testContent
      }
    }

    // 添加最后一张卡片
    if (currentCard) {
      cards.push(currentCard.trim())
    }

    // 清理测量容器
    document.body.removeChild(measureContainer)

    return cards
  }

  // 导出为图片
  const handleExport = async (cardIndex: number) => {
    const cardElement = document.getElementById(`card-${cardIndex}`)
    if (!cardElement) return
    
    try {
      // 临时隐藏导出按钮
      const exportButton = cardElement.querySelector('.export-button-container')
      if (exportButton) {
        exportButton.classList.add('hidden')
      }

      // 创建一个临时的导出容器
      const exportContainer = document.createElement('div')
      exportContainer.style.position = 'absolute'
      exportContainer.style.left = '-9999px'
      exportContainer.style.top = '-9999px'
      document.body.appendChild(exportContainer)

      // 克隆卡片元素到临时容器
      const clonedCard = cardElement.cloneNode(true) as HTMLElement
      exportContainer.appendChild(clonedCard)

      // 设置导出尺寸为原始尺寸
      if (selectedSize.width !== 'auto') {
        const targetWidth = Number(selectedSize.width)
        const targetHeight = Number(selectedSize.height)
        const previewWidth = targetWidth / 2  // 预览时的宽度

        // 计算缩放比例
        const scale = targetWidth / previewWidth

        // 设置主容器尺寸为目标尺寸
        clonedCard.style.width = `${targetWidth}px`
        clonedCard.style.height = `${targetHeight}px`
        
        // 调整字体大小和内边距
        const contentContainer = clonedCard.querySelector('.markdown-content') as HTMLElement
        if (contentContainer) {
          contentContainer.style.fontSize = `${fontSize * scale}px`
          // 设置 Markdown 样式
          contentContainer.style.lineHeight = '1.6'
          // 设置标题样式
          const headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6')
          headings.forEach(heading => {
            ;(heading as HTMLElement).style.fontWeight = 'bold'
            ;(heading as HTMLElement).style.marginBottom = '0.5em'
          })
          // 设置段落样式
          const paragraphs = contentContainer.querySelectorAll('p')
          paragraphs.forEach(p => {
            ;(p as HTMLElement).style.marginBottom = '1em'
          })
        }

        // 调整内边距
        const paddingContainer = clonedCard.querySelector('.flex-1') as HTMLElement
        if (paddingContainer) {
          paddingContainer.style.padding = `${padding * scale}px`
        }
      }

      const canvas = await html2canvas(clonedCard, {
        scale: 2, // 2倍清晰度
        backgroundColor: selectedStyle.background,
        width: selectedSize.width === 'auto' ? undefined : Number(selectedSize.width),
        height: selectedSize.height === 'auto' ? undefined : Number(selectedSize.height),
      })
      
      // 清理临时元素
      document.body.removeChild(exportContainer)
      
      // 恢复导出按钮显示
      if (exportButton) {
        exportButton.classList.remove('hidden')
      }
      
      const link = document.createElement('a')
      link.download = `card-${cardIndex + 1}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  const cards = splitIntoCards(markdown)

  return (
    <>
      <div className="min-h-screen p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight">Markdown 转换工具</h1>
            <p className="text-[var(--text-secondary)] text-xl">
            将 Markdown 文本渲染为卡片
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* 编辑区域 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  输入 Markdown 文本
                </label>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full h-[600px] p-4 font-mono text-sm rounded-xl border 
                    border-[var(--border)] focus:ring-2 focus:ring-blue-100 
                    outline-none resize-none"
                  placeholder="在此粘贴 Markdown 文本..."
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* 字体大小控制 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                      字体大小: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="24"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {/* 内边距控制 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                      内边距: {padding}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="64"
                      value={padding}
                      onChange={(e) => setPadding(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    卡片样式
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {cardStyles.map((style, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedStyle(style)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedStyle === style 
                            ? 'border-blue-500 ring-2 ring-blue-100' 
                            : 'border-[var(--border)] hover:border-blue-500'
                        }`}
                        style={{
                          background: style.background,
                          color: style.textColor,
                        }}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text-secondary)]">
                  卡片尺寸
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {cardSizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-xl border transition-all ${
                        selectedSize === size 
                          ? 'border-blue-500 ring-2 ring-blue-100' 
                          : 'border-[var(--border)] hover:border-blue-500'
                      }`}
                    >
                      <div className="text-sm font-medium">{size.name}</div>
                      <div className="mt-1 text-xs text-[var(--text-secondary)]">
                        {size.description}
                      </div>
                      <div className="mt-2 text-xs text-[var(--text-secondary)]">
                        {size.width === 'auto' ? '自适应' : `${size.width}×${size.height}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 预览区域 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 text-[var(--text-secondary)] border-b border-[var(--border)]">
                <div className="text-sm">
                  预览
                  {selectedSize.width !== 'auto' && (
                    <span className="ml-2 text-xs">
                      {selectedSize.width} × {selectedSize.height}
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  {cards.length > 1 && `${cards.length} 张卡片`}
                </div>
              </div>

              <div className="h-[1200px] overflow-y-auto">
                <div className="space-y-12 pb-12">
                  {cards.map((cardContent, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center"
                    >
                      <div
                        id={`card-${index}`}
                        className="rounded-xl border border-[var(--border)] overflow-hidden shadow-sm"
                        style={{
                          background: selectedStyle.background,
                          color: selectedStyle.textColor,
                          width: selectedSize.width === 'auto' ? 'auto' : `${Number(selectedSize.width) / 2}px`,
                          height: selectedSize.height === 'auto' ? 'auto' : `${Number(selectedSize.height) / 2}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          transform: 'scale(1)', // 确保不会被缩放影响
                        }}
                      >
                        <div 
                          className="flex-1 overflow-y-auto"
                          style={{ padding: `${padding}px` }}
                        >
                          <div 
                            className="markdown-content prose prose-sm" 
                            style={{ 
                              fontSize: `${fontSize}px`,
                              // 确保内容不会超出容器
                              width: '100%',
                              maxWidth: '100%',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word'
                            }}
                          >
                            <ReactMarkdown
                              components={{
                                // 自定义 Markdown 组件样式
                                h1: ({ node, ...props }) => (
                                  <h1 
                                    style={{ 
                                      fontSize: '1.5em', 
                                      fontWeight: 'bold',
                                      overflowWrap: 'break-word',
                                      wordWrap: 'break-word',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                h2: ({ node, ...props }) => (
                                  <h2 
                                    style={{ 
                                      fontSize: '1.3em', 
                                      fontWeight: 'bold',
                                      overflowWrap: 'break-word',
                                      wordWrap: 'break-word',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                h3: ({ node, ...props }) => (
                                  <h3 
                                    style={{ 
                                      fontSize: '1.1em', 
                                      fontWeight: 'bold',
                                      overflowWrap: 'break-word',
                                      wordWrap: 'break-word',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                p: ({ node, ...props }) => (
                                  <p 
                                    style={{ 
                                      marginBottom: '1em',
                                      overflowWrap: 'break-word',
                                      wordWrap: 'break-word',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                ul: ({ node, ...props }) => (
                                  <ul 
                                    style={{ 
                                      paddingLeft: '1.5em', 
                                      marginBottom: '1em',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                ol: ({ node, ...props }) => (
                                  <ol 
                                    style={{ 
                                      paddingLeft: '1.5em', 
                                      marginBottom: '1em',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                li: ({ node, ...props }) => (
                                  <li 
                                    style={{ 
                                      marginBottom: '0.5em',
                                      overflowWrap: 'break-word',
                                      wordWrap: 'break-word',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                blockquote: ({ node, ...props }) => (
                                  <blockquote 
                                    style={{ 
                                      borderLeft: '4px solid currentColor',
                                      paddingLeft: '1em',
                                      marginLeft: 0,
                                      marginBottom: '1em',
                                      opacity: 0.8,
                                      overflowWrap: 'break-word',
                                      wordWrap: 'break-word',
                                      maxWidth: '100%'
                                    }} 
                                    {...props} 
                                  />
                                ),
                                // 添加图片控制
                                img: ({ node, ...props }) => (
                                  <img 
                                    style={{ 
                                      maxWidth: '100%',
                                      height: 'auto'
                                    }} 
                                    {...props} 
                                  />
                                ),
                              }}
                            >
                              {cardContent}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div className="p-4 border-t border-[var(--border)] bg-white/50 export-button-container">
                          <button
                            onClick={() => handleExport(index)}
                            className="btn-primary w-full hover:scale-[1.02] active:scale-[0.98] transition-transform"
                          >
                            导出卡片 {index + 1}
                          </button>
                        </div>
                      </div>
                      {cards.length > 1 && (
                        <div className="mt-2 text-xs text-[var(--text-secondary)]">
                          {index + 1} / {cards.length}
                        </div>
                      )}
                    </div>
                  ))}
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