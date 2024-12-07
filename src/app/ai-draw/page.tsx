'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Footer from '@/components/Footer'
import ProgressBar from '@/components/ProgressBar'

interface GenerationResult {
  id: string
  prompt: string
  negativePrompt: string
  imageUrl: string
  createdAt: number
  status: 'generating' | 'completed' | 'failed'
  progress: number
}

export default function AiDrawPage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<GenerationResult[]>([])

  // 获取历史记录
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/storage')
      if (!response.ok) {
        throw new Error('Failed to load history')
      }
      
      const historyItems: GenerationResult[] = await response.json()
      setResults(historyItems)
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }

  // AI优化提示语
  const enhancePrompt = async (rawPrompt: string) => {
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: rawPrompt })
      })

      if (!response.ok) {
        console.error('优化提示词失败:', await response.text())
        return rawPrompt
      }
      
      const data = await response.json()
      return data.result?.response || rawPrompt
    } catch (error) {
      console.error('优化提示词失败:', error)
      return rawPrompt
    }
  }

  // 生成图片
  const generateImage = async () => {
    if (!prompt) return
    
    const tempId = Date.now().toString()
    setIsGenerating(true)
    
    try {
      // 添加临时结果
      setResults(prev => [{
        id: tempId,
        prompt,
        negativePrompt,
        imageUrl: '',
        createdAt: Date.now(),
        status: 'generating',
        progress: 0
      }, ...prev])

      // 优化提示词
      const enhancedPrompt = await enhancePrompt(prompt)
      
      // 生成图片
      const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SILICONFLOW_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'black-forest-labs/FLUX.1-schnell',
          prompt: enhancedPrompt,
          negative_prompt: negativePrompt,
          image_size: '1024x1024',
          batch_size: 1,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          prompt_enhancement: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.images?.[0]?.url) {
        throw new Error('Invalid response format')
      }

      const imageUrl = data.images[0].url
      
      // 上传到Firebase
      try {
        const uploadResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrl,
            metadata: {
              id: tempId,
              prompt: enhancedPrompt,
              negativePrompt,
              createdAt: Date.now().toString()
            }
          })
        })

        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }

        const uploadData = await uploadResponse.json()
        
        // 更新结果
        setResults(prev => prev.map(r => 
          r.id === tempId ? {
            ...r,
            imageUrl: uploadData.imageUrl,
            status: 'completed',
            progress: 100
          } : r
        ))
        
      } catch (error) {
        console.error('上传到Firebase失败:', error)
        // 使用原始URL
        setResults(prev => prev.map(r => 
          r.id === tempId ? {
            ...r,
            imageUrl,
            status: 'completed',
            progress: 100
          } : r
        ))
      }
      
    } catch (error) {
      console.error('生成失败:', error)
      setResults(prev => prev.map(r => 
        r.id === tempId ? {
          ...r,
          status: 'failed',
          error: error instanceof Error ? error.message : '生成失败，请重试',
          progress: 0
        } : r
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="min-h-screen p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight">AI绘画</h1>
            <p className="text-[var(--text-secondary)] text-xl">
              通过文字描述生成独特的AI术作品
            </p>
          </div>

          <div className="space-y-8">
            {/* 输入区域 */}
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述你想要生成的图片..."
                className="w-full h-32 p-4 rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                disabled={isGenerating}
              />
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="不想要出现的元素（可选）..."
                className="w-full h-20 p-4 rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                disabled={isGenerating}
              />
              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt}
                className="btn-primary w-full"
              >
                {isGenerating ? '生成中...' : '开始生成'}
              </button>
            </div>

            {/* 结果展示 */}
            <div className="grid md:grid-cols-2 gap-8">
              {results.map(result => (
                <div key={result.id} className="modern-card p-6 space-y-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                    {result.imageUrl ? (
                      <Image
                        src={result.imageUrl}
                        alt={result.prompt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ProgressBar progress={result.progress} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">提示词</p>
                    <p className="text-sm text-[var(--text-secondary)]">{result.prompt}</p>
                    {result.negativePrompt && (
                      <>
                        <p className="font-medium">反向提示词</p>
                        <p className="text-sm text-[var(--text-secondary)]">{result.negativePrompt}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 