'use client';

import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageDetails {
    imageUrl: string;
    originalPrompt: string;
    enhancedPrompt: string;
    negativePrompt?: string;
    createdAt: string;
}

export default function ImageDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [details, setDetails] = useState<ImageDetails | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const docRef = doc(db, 'imageHistory', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setDetails(docSnap.data() as ImageDetails);
            }
        };
        
        fetchDetails();
    }, [id]);

    if (!details) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="animate-spin h-8 w-8 text-blue-600">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F7]">
            {/* 顶部导航 */}
            <nav className="sticky top-0 backdrop-blur-xl bg-white/75 border-b border-gray-200 z-50">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <button
                            onClick={() => router.back()}
                            className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>返回</span>
                        </button>
                        <div className="text-sm text-gray-500">
                            创建于 {new Date(details.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            </nav>

            {/* 主要内容 - 左右布局 */}
            <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* 左侧图片展示 */}
                    <div className="w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="relative" style={{ height: 'calc(100vh - 180px)' }}>
                            <Image
                                src={details.imageUrl}
                                alt={details.originalPrompt}
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* 右侧信息展示 */}
                    <div className="w-1/3 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">原始提示词</h3>
                                    <p className="text-lg text-gray-900 bg-gray-50 rounded-xl p-4">
                                        {details.originalPrompt}
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">优化后的提示词</h3>
                                    <p className="text-lg text-gray-900 bg-blue-50 rounded-xl p-4">
                                        {details.enhancedPrompt}
                                    </p>
                                </div>

                                {details.negativePrompt && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">反向提示词</h3>
                                        <p className="text-lg text-gray-900 bg-red-50 rounded-xl p-4">
                                            {details.negativePrompt}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 下载按钮 */}
                            <a
                                href={details.imageUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white 
                                    bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm hover:from-blue-700 
                                    hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                    transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                下载图片
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 