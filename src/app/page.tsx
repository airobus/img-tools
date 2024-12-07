import React from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <div className="min-h-screen p-12">
        <div className="p-8 animate-slide-in">
          <div className="max-w-5xl mx-auto space-y-12">
            {/* 标题区域 */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold gradient-text">
                图片魔方
              </h1>
              <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                简单、高效、专业的在线图像处理工具，让创作更轻松
              </p>
            </div>

            {/* 工具卡片 */}
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: '图片压缩',
                  description: '智能压缩算法，在保持图片质量的同时大幅减小文件体积',
                  href: '/compress',
                  icon: (
                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7M5 10l7 7 7-7" />
                    </svg>
                  ),
                  bgColor: 'bg-blue-50'
                },
                {
                  title: 'AI绘画',
                  description: '通过文字描述生成独特的AI艺术作品',
                  href: '/ai-draw',
                  icon: (
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  bgColor: 'bg-purple-50'
                },
                {
                  title: 'SVG编辑',
                  description: '在线编辑和预览SVG代码，支持实时预览和格式化',
                  href: '/svg',
                  icon: (
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  ),
                  bgColor: 'bg-green-50'
                },
                {
                  title: '图片尺寸',
                  description: '轻松调整图片大小，支持保持宽高比和旋转',
                  href: '/resize',
                  icon: (
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  ),
                  bgColor: 'bg-orange-50'
                }
              ].map((tool) => (
                <Link 
                  key={tool.href}
                  href={tool.href} 
                  className="modern-card group p-8 hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-6">
                    <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center`}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-semibold group-hover:text-[var(--primary)] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="flex items-center text-[var(--primary)] font-medium">
                        立即使用
                        <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* 即将推出卡片 */}
              <div className="modern-card p-8 opacity-75">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-gray-400">更多工具</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Logo生成、AI图像生成等更多强大工具即将推出
                    </p>
                    <div className="flex items-center text-gray-400 font-medium">
                      即将推出
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 特性介绍 */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  title: '简单易用',
                  description: '直观的界面设计，无需复杂操作',
                  icon: '⚡️'
                },
                {
                  title: '高效处理',
                  description: '先进的处理算法，快速完成图像处理',
                  icon: '🚀'
                },
                {
                  title: '安全可靠',
                  description: '本地处理，保护您的图片安全',
                  icon: '🔒'
                },
                {
                  title: '永久免费',
                  description: '所有功能完全免费，无需注册登录',
                  icon: '🎁',
                  highlight: true // 添加高亮标记
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className={`modern-card p-6 text-center space-y-4 transition-all hover:-translate-y-1 
                    ${feature.highlight ? 'ring-2 ring-[var(--primary)] bg-gradient-to-br from-blue-50 to-white' : ''}`}
                >
                  <div className="text-3xl">{feature.icon}</div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)]">{feature.description}</p>
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
