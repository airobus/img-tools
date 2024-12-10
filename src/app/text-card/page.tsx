'use client'

import React, { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import Footer from '@/components/Footer'
import ColorPicker from '@/components/ColorPicker'
import html2canvas from 'html2canvas'

// 预设的背景模板
const backgroundTemplates = [
  // 浅色系
  { name: '无背景', value: 'transparent', type: 'light' },
  { name: '纯白', value: '#ffffff', type: 'light' },
  { name: '象牙白', value: '#fdfdf9', type: 'light' },
  { name: '暖灰', value: '#f5f5f4', type: 'light' },
  { name: '薄荷', value: '#f0fdf4', type: 'light' },
  { name: '天空', value: '#f0f9ff', type: 'light' },
  { name: '玫瑰', value: '#fff1f2', type: 'light' },
  { name: '薰衣草', value: '#faf5ff', type: 'light' },
  { name: '珊瑚', value: '#fff5f5', type: 'light' },
  { name: '柠檬', value: '#fefce8', type: 'light' },
  { name: '奶咖', value: '#fef3c7', type: 'light' },
  { name: '青瓷', value: '#ecfeff', type: 'light' },
  
  // 深色系
  { name: '墨黑', value: '#18181b', type: 'dark' },
  { name: '深蓝', value: '#172554', type: 'dark' },
  { name: '深紫', value: '#2e1065', type: 'dark' },
  { name: '深绿', value: '#14532d', type: 'dark' },
  { name: '深褐', value: '#422006', type: 'dark' },
  { name: '深灰', value: '#1c1917', type: 'dark' },
  
  // 渐变色
  { name: '日出', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', type: 'gradient' },
  { name: '极光', value: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', type: 'gradient' },
  { name: '黄昏', value: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', type: 'gradient' },
  { name: '海洋', value: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)', type: 'gradient' },
]

// 免费字体选项
const fontOptions = [
  { name: '思源黑体', value: '"Noto Sans SC", sans-serif' },
  { name: '思源宋体', value: '"Noto Serif SC", serif' },
  { name: '霞鹜文楷', value: '"LXGW WenKai", serif' },
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Roboto Mono', value: '"Roboto Mono", monospace' },
  { name: '阿里巴巴普惠体', value: '"Alibaba PuHuiTi", sans-serif' },
  { name: '站酷高端黑', value: '"ZCOOL QingKe HuangYou", sans-serif' },
  { name: '站酷快乐体', value: '"ZCOOL KuaiLe", sans-serif' },
  { name: '文泉驿微米黑', value: '"WenQuanYi Micro Hei", sans-serif' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
]

// 添加格式化 Markdown 的函数
const formatMarkdown = (text: string) => {
  if (!text) return text
  
  const lines = text.split('\n')
  const formattedLines = lines.map(line => {
    // 标题
    if (line.match(/^#{1,6}\s/)) {
      return `\n${line}\n`
    }
    // 列表
    if (line.match(/^[-*+]\s/)) {
      return line.replace(/^([-*+])\s+/, '$1 ')
    }
    // 引用
    if (line.match(/^>\s/)) {
      return `\n${line}\n`
    }
    // 代码块保持原样
    if (line.match(/^```/)) {
      return line
    }
    // 其他行
    return line
  })

  return formattedLines
    .join('\n')
    // 删除多余的空行
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// 修改 emoji 选项，确保每个都是唯一的
const emojiOptions = [
  '📝', '💡', '✨', '🎯', '📚', '💫', '🌟', '⭐', '🔥', '💪',
  '🎨', '🎭', '🎪', '🎡', '🎢', '🎠', '🎮', '🎲', '🎳', '🎵',
  '🌈', '🌞', '🌙', '🌠', '💫', '⚡', '☄️', '🌍', '🌸', '🍀'
]

// 预设的柔和配色方案
const pastelPairs = [
  { bg: '#E6F3FF', outer: '#FFF5E6' },  // 天蓝配杏色
  { bg: '#F0FFF4', outer: '#FFF0F4' },  // 薄荷配粉红
  { bg: '#FFF5F5', outer: '#F5F5FF' },  // 浅红配淡紫
  { bg: '#FFFFF0', outer: '#F0FFFF' },  // 象牙配天青
  { bg: '#F5F5DC', outer: '#E6E6FA' },  // 米色配薰衣草
  { bg: '#E0FFFF', outer: '#FFE4E1' },  // 青色配蜜桃
  { bg: '#F0F8FF', outer: '#F5FFFA' },  // 爱丽丝蓝配薄荷绿
  { bg: '#FFF0F5', outer: '#F0FFF0' },  // 淡紫红配淡绿
  { bg: '#F5F5F5', outer: '#FFF8DC' },  // 烟白配玉米丝
  { bg: '#E6E6FA', outer: '#F0FFFF' },  // 薰衣草配天蓝
]

const generateRandomPastelColor = () => {
  // 有 30% 的概率使用预设配色
  if (Math.random() < 0.3) {
    const pair = pastelPairs[Math.floor(Math.random() * pastelPairs.length)]
    return {
      bg: pair.bg,
      outer: pair.outer
    }
  }

  // 70% 的概率生成随机柔和色
  const generateColor = () => {
    const hue = Math.floor(Math.random() * 360)  // 随机色相
    const saturation = 25 + Math.floor(Math.random() * 30)  // 20-50% 饱和度
    const lightness = 80 + Math.floor(Math.random() * 15)   // 80-95% 亮度
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  return {
    bg: generateColor(),
    outer: generateColor()
  }
}

export default function TextCardPage() {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(16)
  const [selectedFont, setSelectedFont] = useState(fontOptions[0].value)
  const [backgroundColor, setBackgroundColor] = useState('#4ade80')
  const [textColor, setTextColor] = useState('#000000')
  const [splitCards, setSplitCards] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [customBackground, setCustomBackground] = useState('')
  const [outerBackgroundColor, setOuterBackgroundColor] = useState('#fef9c3')
  const [selectedEmoji, setSelectedEmoji] = useState('📝')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleExport = async () => {
    if (!previewRef.current) return
    
    try {
      // 使用 html2canvas 生成图片
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,  // 2倍清晰度
        useCORS: true,  // 允许跨域
        backgroundColor: null,  // 保持透明背景
        logging: false,  // 关闭日志
      })

      // 转换为图片并下载
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = `text-card-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('导出图片失败:', error)
    }
  }

  const handleFormatMarkdown = () => {
    setText(formatMarkdown(text))
  }

  // 获取当前日期的格式化函数
  const getFormattedDate = () => {
    const now = new Date()
    return now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 修改随机配色函数
  const handleRandomColors = () => {
    const colors = generateRandomPastelColor()
    setBackgroundColor(colors.bg)
    setOuterBackgroundColor(colors.outer)
    setCustomBackground(colors.bg)
  }

  return (
    <>
      <div className="min-h-screen p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight">文字卡片生成器</h1>
            <p className="text-[var(--text-secondary)] text-xl">
              将文字转换为精美的图片卡片，支持 Markdown 语法
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* 编辑区域 */}
            <div className="space-y-6">
              {/* Markdown 输入 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    文字内容 (支持 Markdown)
                  </label>
                  <button
                    onClick={handleFormatMarkdown}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 
                      hover:bg-gray-200 transition-colors"
                  >
                    格式化
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-40 p-4 font-mono text-sm rounded-xl border 
                    border-[var(--border)] focus:ring-2 focus:ring-blue-100 
                    outline-none resize-none"
                  placeholder="在此输入文字..."
                />
              </div>

              {/* 样式控制面板 */}
              <div className="space-y-6 p-6 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                {/* 背景模板选择 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    背景模板
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {/* 浅色系 */}
                    <div className="col-span-6 text-xs text-[var(--text-secondary)] mt-2">浅色系</div>
                    {backgroundTemplates.filter(t => t.type === 'light').map((template) => (
                      <button
                        key={template.value}
                        onClick={() => setBackgroundColor(template.value)}
                        className={`h-8 rounded-lg transition-all relative group
                          ${backgroundColor === template.value ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'}`}
                        style={{ background: template.value }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs">
                          {template.name}
                        </span>
                      </button>
                    ))}
                    
                    {/* 深色系 */}
                    <div className="col-span-6 text-xs text-[var(--text-secondary)] mt-2">深色系</div>
                    {backgroundTemplates.filter(t => t.type === 'dark').map((template) => (
                      <button
                        key={template.value}
                        onClick={() => setBackgroundColor(template.value)}
                        className={`h-8 rounded-lg transition-all relative group
                          ${backgroundColor === template.value ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'}`}
                        style={{ background: template.value }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs text-white">
                          {template.name}
                        </span>
                      </button>
                    ))}
                    
                    {/* 渐变色 */}
                    <div className="col-span-6 text-xs text-[var(--text-secondary)] mt-2">渐变色</div>
                    {backgroundTemplates.filter(t => t.type === 'gradient').map((template) => (
                      <button
                        key={template.value}
                        onClick={() => setBackgroundColor(template.value)}
                        className={`h-8 rounded-lg transition-all relative group
                          ${backgroundColor === template.value ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'}`}
                        style={{ background: template.value }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs">
                          {template.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* 自定义背景色 */}
                  <div className="mt-4 flex gap-2">
                    <ColorPicker
                      color={customBackground}
                      onChange={(color) => {
                        setCustomBackground(color)
                        setBackgroundColor(color)
                      }}
                    />
                    <button
                      onClick={() => setBackgroundColor('transparent')}
                      className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      清除背景
                    </button>
                    <button
                      onClick={handleRandomColors}
                      className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 
                        text-white hover:opacity-90 transition-opacity"
                    >
                      随机配色
                    </button>
                  </div>
                </div>

                {/* 字体选择 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    字体
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] 
                      focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 字体大小 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    字体大小: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* 颜色选择器 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                      文字颜色
                    </label>
                    <ColorPicker
                      color={textColor}
                      onChange={setTextColor}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">
                      背景颜色
                    </label>
                    <ColorPicker
                      color={backgroundColor}
                      onChange={setBackgroundColor}
                    />
                  </div>
                </div>

                {/* 分隔卡片选项 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="splitCards"
                    checked={splitCards}
                    onChange={(e) => setSplitCards(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 
                      focus:ring-blue-500"
                  />
                  <label
                    htmlFor="splitCards"
                    className="text-sm font-medium text-[var(--text-secondary)]"
                  >
                    将长文本分隔为多张卡片
                  </label>
                </div>
              </div>
            </div>

            {/* 预览区域 */}
            <div className="space-y-4">
              {/* 添加预览标题 */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium">预览</h2>
                <div className="text-sm text-[var(--text-secondary)]">
                  支持导出为图片
                </div>
              </div>

              {/* 外层卡片 - 添加最大宽度限制 */}
              <div className="max-w-[480px] mx-auto w-full rounded-2xl border border-[var(--border)] 
                flex items-center justify-center p-6"
                style={{ 
                  backgroundColor: outerBackgroundColor,
                  aspectRatio: text.length > 100 ? 'auto' : '1/1',
                }}
              >
                {/* 内层卡片保持不变 */}
                <div 
                  ref={previewRef}
                  className="w-[98%] rounded-2xl border border-[var(--border)] shadow-lg relative group"
                  style={{
                    background: backgroundColor,
                    color: textColor,
                    fontFamily: selectedFont,
                    fontSize: `${fontSize}px`,
                    aspectRatio: text.length > 100 ? 'auto' : '1/1',
                  }}
                >
                  {/* 左上角日期 */}
                  <div className="absolute top-6 left-6">
                    <span className="text-sm font-bold text-gray-500">
                      {getFormattedDate()}
                    </span>
                  </div>

                  {/* 右下角 Emoji */}
                  <div className="absolute bottom-6 right-6">
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-2xl hover:scale-110 transition-transform"
                      >
                        <span className="text-gray-500">
                          {selectedEmoji}
                        </span>
                      </button>

                      {/* Emoji 选择器保持不变 */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 p-4 bg-white rounded-xl 
                          border border-[var(--border)] shadow-lg z-10"
                        >
                          <div className="grid grid-cols-6 gap-2 w-[240px]">
                            {emojiOptions.map((emoji, index) => (
                              <button
                                key={`${emoji}-${index}`}  // 使用组合键确保唯一性
                                onClick={() => {
                                  setSelectedEmoji(emoji)
                                  setShowEmojiPicker(false)
                                }}
                                className="text-xl hover:scale-110 transition-transform p-1"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 内容区域 - 增加上边距，给日期留出更多空间 */}
                  <div className="w-full h-full p-12 pt-20">
                    <div className="w-full max-w-2xl mx-auto">
                      <ReactMarkdown>
                        {text || '# 这里将实时预览效果...\n\n## 支持Markdown语法'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 底部控制区域 */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-[var(--text-secondary)]">
                    底色
                  </label>
                  <div className="mt-2">
                    <ColorPicker
                      color={outerBackgroundColor}
                      onChange={setOuterBackgroundColor}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="btn-primary"
                  >
                    导出图片
                  </button>
                  <button
                    onClick={() => setText('')}
                    className="btn-secondary"
                  >
                    清空内容
                  </button>
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