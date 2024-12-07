'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { collection, query, orderBy, limit, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
    const q = query(
      collection(db, 'imageHistory'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: GenerationResult[] = snapshot.docs.map(doc => ({
        id: doc.id,
        prompt: doc.data().originalPrompt,
        negativePrompt: doc.data().negativePrompt || '',
        imageUrl: doc.data().imageUrl || '',
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        status: doc.data().status || 'generating',
        progress: 100
      }));
      setResults(items);
    });

    return () => unsubscribe();
  }, []);

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
    if (!prompt) return;
    
    // 在外部声明 docRef
    let docRef;
    
    try {
      // 设置生成状态
      setIsGenerating(true)
      
      // 1. 先创建一个记录
      docRef = await addDoc(collection(db, 'imageHistory'), {
        originalPrompt: prompt,
        createdAt: new Date(),
        status: 'generating'
      });

      // 2. 优化提示词
      const enhancedPrompt = await enhancePrompt(prompt)

      // 3. 调用 AI 生成图片
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: enhancedPrompt,
          negativePrompt 
        })
      });

      const data = await response.json();
      
      // 4. 更新记录，添加生成的图片URL
      await updateDoc(doc(db, 'imageHistory', docRef.id), {
        imageUrl: data.images[0].url,
        status: 'completed'
      });

    } catch (error: unknown) {
      console.error('生成失败:', error);
      // 更新状态为失败
      if (docRef) {
        await updateDoc(doc(db, 'imageHistory', docRef.id), {
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    } finally {
      // 重置生成状态
      setIsGenerating(false)
    }
  };

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
            {/* 输入域 */}
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

            {/* 结果展��� */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((result) => (
                <div key={result.id} className="relative">
                  {result.imageUrl && (
                    <Image 
                      src={result.imageUrl} 
                      alt={result.prompt}
                      width={300}
                      height={300}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  )}
                  {result.status === 'generating' && (
                    <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">生成中...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 