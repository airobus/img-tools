'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { collection, query, orderBy, limit, onSnapshot, addDoc, doc, updateDoc, getCountFromServer, getDocs, startAfter } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Footer from '@/components/Footer'
import Link from 'next/link'

interface GenerationResult {
    id: string
    prompt: string
    negativePrompt: string
    imageUrl: string
    createdAt: number
    status: 'generating' | 'completed' | 'failed'
    progress: number
    steps?: string[]
}

// 添加步骤类型定义
interface GenerationStep {
    name: string
    completed: boolean
    progress: number
}

// 添加尺寸选项类型
interface ImageSize {
    label: string;
    value: string;
}

export default function AiDrawPage() {
    const [isClient, setIsClient] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [negativePrompt, setNegativePrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [results, setResults] = useState<GenerationResult[]>([])
    const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
        { name: '准备创作', completed: false, progress: 0 },
        { name: '优化提示词', completed: false, progress: 0 },
        { name: '生成图片', completed: false, progress: 0 },
        { name: '完成', completed: false, progress: 0 }
    ])
    const [totalProgress, setTotalProgress] = useState(0)
    const [selectedSize, setSelectedSize] = useState<string>('1024x576')
    const [totalCount, setTotalCount] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [lastVisible, setLastVisible] = useState<any>(null)
    
    // 尺寸选项
    const imageSizes: ImageSize[] = [
        { label: '方形', value: '1024x1024' },
        { label: '横幅', value: '1024x576' },
        { label: '竖幅', value: '576x1024' },
        { label: '宽幅', value: '768x512' },
        { label: '长幅', value: '512x1024' },
        { label: '高幅', value: '768x1024' },
    ]

    // 确保只在客户端渲染
    useEffect(() => {
        setIsClient(true)
    }, [])

    // 获取历史记录
    useEffect(() => {
        if (!isClient) return;

        const q = query(
            collection(db, 'imageHistory'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: GenerationResult[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id,
                    prompt: data.originalPrompt,
                    negativePrompt: data.negativePrompt || '',
                    imageUrl: data.imageUrl || '',
                    createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
                    status: data.status || 'generating',
                    progress: 100,
                    steps: data.steps || ['优化提示词', '生成图片', '完成']
                });
            });
            
            setResults(items);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === 20);
        });

        return () => unsubscribe();
    }, [isClient]);

    // 获取总数
    useEffect(() => {
        if (!isClient) return;

        const q = query(collection(db, 'imageHistory'));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            // 使用 count() 获取总数
            const countSnapshot = await getCountFromServer(collection(db, 'imageHistory'));
            setTotalCount(countSnapshot.data().count);
        });

        return () => unsubscribe();
    }, [isClient]);

    // 加载更多
    const loadMore = async () => {
        if (!lastVisible) return;

        const next = query(
            collection(db, 'imageHistory'),
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(20)
        );

        const snapshot = await getDocs(next);
        const newItems: GenerationResult[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                prompt: data.originalPrompt,
                negativePrompt: data.negativePrompt || '',
                imageUrl: data.imageUrl || '',
                createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
                status: data.status || 'generating',
                progress: 100,
                steps: data.steps || ['优化提示词', '生成图片', '完成']
            };
        });

        setResults(prev => [...prev, ...newItems]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 20);
    };

    // 骨架屏
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center">
                <div className="animate-pulse space-y-4 w-full max-w-5xl px-6">
                    <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    
                    <div className="space-y-4">
                        <div className="h-36 bg-gray-200 rounded-2xl"></div>
                        <div className="h-24 bg-gray-200 rounded-2xl"></div>
                        <div className="h-16 bg-gray-200 rounded-2xl"></div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
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
        if (!prompt) return;
        
        let docRef;
        
        try {
            setIsGenerating(true)
            setTotalProgress(0)  // 重置进度
            
            // 创建进度更新定时器
            const totalProgressInterval = setInterval(() => {
                setTotalProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(totalProgressInterval)
                        return prev
                    }
                    return prev + 1
                })
            }, 100)

            // 重置步骤和进度
            setGenerationSteps([
                { name: '准备创作', completed: true, progress: 100 },
                { name: '优化提示词', completed: false, progress: 0 },
                { name: '生成图片', completed: false, progress: 0 },
                { name: '完成', completed: false, progress: 0 }
            ])

            docRef = await addDoc(collection(db, 'imageHistory'), {
                originalPrompt: prompt,
                negativePrompt: negativePrompt,
                createdAt: new Date(),
                status: 'generating'
            });

            // 优化提示词阶段
            const progressInterval = setInterval(() => {
                setGenerationSteps(prev => prev.map((step, idx) => {
                    if (idx === 1 && !step.completed) {
                        return { ...step, progress: Math.min(step.progress + 5, 90) }
                    }
                    return step
                }))
            }, 100)

            const enhancedPrompt = await enhancePrompt(prompt)
            clearInterval(progressInterval)
            
            // 完成优化提示词
            setGenerationSteps(prev => prev.map((step, idx) => 
                idx === 1 ? { ...step, completed: true, progress: 100 } : step
            ))

            // 生成图片阶段
            const imageInterval = setInterval(() => {
                setGenerationSteps(prev => prev.map((step, idx) => {
                    if (idx === 2 && !step.completed) {
                        return { ...step, progress: Math.min(step.progress + 2, 90) }
                    }
                    return step
                }))
            }, 100)

            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: enhancedPrompt,
                    negativePrompt,
                    imageSize: selectedSize
                })
            });

            clearInterval(imageInterval)
            const data = await response.json();

            // 完成所有步骤
            setGenerationSteps(prev => prev.map(step => ({ 
                ...step, 
                completed: true, 
                progress: 100 
            })))

            await updateDoc(doc(db, 'imageHistory', docRef.id), {
                imageUrl: data.images[0].url,
                status: 'completed',
                originalPrompt: prompt,
                enhancedPrompt: enhancedPrompt,
                negativePrompt: negativePrompt,
                createdAt: new Date().toISOString()
            });

            clearInterval(totalProgressInterval)
            setTotalProgress(100)  // 完成时设置为 100%

        } catch (error: unknown) {
            console.error('生成失败:', error);
            if (docRef) {
                await updateDoc(doc(db, 'imageHistory', docRef.id), {
                    status: 'failed',
                    error: error instanceof Error ? error.message : '未知错误'
                });
            }
        } finally {
            setIsGenerating(false)
        }
    };

    return (
        <div className="min-h-screen min-w-[1024px] bg-gradient-to-b from-gray-50 to-white flex flex-col">
            <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-16 space-y-16">
                {/* 标题部分 */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                        AI 艺术创作
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        通过智能提示词，将您的想象力化为惊人的视觉艺术
                    </p>
                </div>

                <div className="w-full max-w-5xl mx-auto space-y-12">
                    {/* 输入区域 */}
                    <div className="w-full bg-white shadow-2xl rounded-3xl p-8 border border-gray-100 space-y-6">
                        {/* 主提示词输入 */}
                        <div className="relative group">
                            <label
                                htmlFor="main-prompt"
                                className="absolute -top-3 left-4 bg-white px-2 text-sm text-blue-600 
                           transition-all group-focus-within:text-blue-700"
                            >
                                创作描述
                            </label>
                            <textarea
                                id="main-prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="描述你想要创作的画面..."
                                className="w-full h-36 p-6 rounded-2xl border-2 border-gray-200 
                           transition-all duration-300 
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                           hover:border-gray-300
                           resize-none text-lg
                           placeholder-gray-400"
                                disabled={isGenerating}
                            />
                            <div className="absolute bottom-3 right-4 text-sm text-gray-400">
                                {prompt.length}/500
                            </div>
                        </div>

                        {/* 反向提示词输入 */}
                        <div className="relative group">
                            <label
                                htmlFor="negative-prompt"
                                className="absolute -top-3 left-4 bg-white px-2 text-sm text-gray-500 
                           transition-all group-focus-within:text-blue-700"
                            >
                                排除元素（可选）
                            </label>
                            <textarea
                                id="negative-prompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="描述你不想出现在画面中的元素..."
                                className="w-full h-24 p-6 rounded-2xl border-2 border-gray-200 
                           transition-all duration-300 
                           focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                           hover:border-gray-300
                           resize-none text-lg
                           placeholder-gray-400"
                                disabled={isGenerating}
                            />
                            <div className="absolute bottom-3 right-4 text-sm text-gray-400">
                                {negativePrompt.length}/300
                            </div>
                        </div>

                        {/* 生成进度步骤 */}
                        {isGenerating && (
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
                                <div 
                                    className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
                                    style={{ width: `${totalProgress}%` }}
                                />
                            </div>
                        )}

                        {/* 步骤详细展示 */}
                        {isGenerating && (
                            <div className="flex justify-between items-center mb-4">
                                {generationSteps.map((step, index) => (
                                    <div 
                                        key={index} 
                                        className="flex flex-col items-center space-y-2 w-full"
                                    >
                                        <div 
                                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                step.completed 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'border-2 border-gray-300 text-gray-300'
                                            }`}
                                        >
                                            {step.completed ? (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <span className="text-sm">{index + 1}</span>
                                            )}
                                        </div>
                                        <span 
                                            className={`text-xs text-center transition-all duration-300 ${
                                                step.completed ? 'text-blue-600' : 'text-gray-400'
                                            }`}
                                        >
                                            {step.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 按钮组 */}
                        <div className="flex gap-4">
                            {/* 尺寸选择下拉菜单 */}
                            <div className="relative w-48">
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    disabled={isGenerating}
                                    className="w-full py-4 px-6 rounded-2xl 
                                        bg-white border-2 border-gray-200
                                        text-gray-700 font-medium
                                        transition-all duration-200
                                        hover:border-gray-300 focus:border-blue-400
                                        focus:ring-2 focus:ring-blue-100
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        appearance-none cursor-pointer"
                                >
                                    {imageSizes.map((size) => (
                                        <option key={size.value} value={size.value}>
                                            {size.label} ({size.value})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* 创作按钮 */}
                            <button
                                onClick={generateImage}
                                disabled={isGenerating || !prompt}
                                className="flex-1 py-4 px-6 rounded-2xl 
                                    bg-gradient-to-r from-blue-600 to-blue-700
                                    hover:from-blue-700 hover:to-blue-800
                                    text-white font-medium text-lg
                                    transition-all duration-300 transform
                                    hover:scale-[1.02] active:scale-[0.98]
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    disabled:hover:scale-100
                                    shadow-xl hover:shadow-2xl
                                    flex items-center justify-center space-x-3
                                    group"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg
                                            className="animate-spin h-6 w-6 text-white group-hover:rotate-180 transition-transform"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="tracking-wider">正在创作...</span>
                                    </>
                                ) : (
                                    <span className="tracking-wider">开始创作</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 生成历史标题 */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            创作历史
                        </h2>
                        <span className="text-sm text-gray-500">
                            共 {totalCount} 张作品
                        </span>
                    </div>

                    {/* 结果展示 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {results.map((result) => (
                            <div key={result.id} className="relative aspect-square">
                                {/* 图片卡片 */}
                                <Link 
                                    href={`/ai-draw/${result.id}`}
                                    className="block group relative rounded-2xl overflow-hidden 
                                        transition-all duration-300 transform hover:scale-[1.02]
                                        hover:shadow-2xl border border-gray-100
                                        w-full h-full"
                                >
                                    {result.imageUrl ? (
                                        <>
                                            <Image
                                                src={result.imageUrl}
                                                alt={result.prompt}
                                                width={300}
                                                height={300}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="absolute bottom-0 p-4 space-y-4 w-full">
                                                    <p className="text-sm text-white line-clamp-2">{result.prompt}</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 rounded-2xl 
                        flex items-center justify-center">
                                            <div className="text-center space-y-2">
                                                <svg className="animate-spin h-8 w-8 mx-auto text-gray-400" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <p className="text-gray-500">创作中...</p>
                                            </div>
                                        </div>
                                    )}
                                </Link>

                                {/* 下载按钮 - 独立于 Link */}
                                {result.imageUrl && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(result.imageUrl, '_blank');
                                        }}
                                        className="absolute bottom-4 right-4 z-10
                                            opacity-0 group-hover:opacity-100
                                            bg-white/10 backdrop-blur-sm rounded-lg
                                            px-4 py-2 text-white text-sm font-medium
                                            hover:bg-white/20 transition-all
                                            flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        下载
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <button 
                            onClick={loadMore}
                            className="w-full mt-8 py-4 text-blue-600 hover:text-blue-700"
                        >
                            加载更多
                        </button>
                    )}
                </div>
            </div>

            {/* 添加 Footer */}
            <Footer />
        </div>
    )
} 