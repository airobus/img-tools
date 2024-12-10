import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/react'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://img-tools.923828.xyz'),
  title: {
    template: '%s - 图片魔方',
    default: '图片魔方 - 专业的在线图像处理工具集'
  },
  description: '免费在线图片处理工具，支持图片压缩、SVG编辑、尺寸调整等功能。本地处理保护隐私，无需上传服务器。',
  keywords: '图片压缩,图片处理,SVG编辑器,图片尺寸调整,在线工具,图片优化,批量压缩',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '图片魔方',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://img-tools.923828.xyz'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const menuItems = [
    {
      name: 'AI绘画',
      href: '/ai-draw',
      enabled: true,
      description: '通过文字描述生成AI艺术作品',
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgColor: 'bg-purple-50'
    },
    {
      name: '图片压缩',
      href: '/compress',
      enabled: true,
      description: '高效压缩图片，保持最佳质量',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7M5 10l7 7 7-7" />
        </svg>
      ),
      bgColor: 'bg-blue-50'
    },
    {
      name: 'SVG编辑',
      href: '/svg',
      enabled: true,
      description: '在线编辑SVG代码',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      bgColor: 'bg-green-50'
    },
    {
      name: '图片尺寸',
      href: '/resize',
      enabled: true,
      description: '调整图片尺寸和比例',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Favicon获取',
      href: '/favicon',
      enabled: true,
      description: '轻松获取网站图标',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: 'bg-teal-50'
    },
    {
      name: '文字卡片',
      href: '/text-card',
      enabled: true,
      description: '生成精美的文字卡片',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 6h16M4 12h16m-7 6h7" 
          />
        </svg>
      ),
      bgColor: 'bg-indigo-50'
    },
    {
      name: 'Logo生成',
      href: '/logo',
      enabled: false,
      description: '快速生成专业的Logo设计',
      icon: (
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      bgColor: 'bg-gray-50'
    },
  ]

  return (
    <html lang="zh" className="h-full">
      <head>
        <link rel="icon" type="public/svg+xml" href="/favicon.svg" />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="27ccf850-f6b7-4cc7-abf1-ee5fc0494756"
        />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;500;700&family=Inter:wght@400;500;700&family=Roboto+Mono&family=JetBrains+Mono&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=ZCOOL+QingKe+HuangYou&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} h-full`}>
        <div className="min-w-[1024px]">
          <div className="flex h-full">
            <Sidebar menuItems={menuItems} />
            {/* 主内容区域 */}
            <main className="flex-1 ml-64 min-h-screen bg-[var(--background)] relative">
              {/* 修改右上角导航的 z-index */}
              <div className="absolute top-6 right-8 flex items-center gap-6 z-50">
                <Link
                  href="/about"
                  className="gradient-text hover:opacity-80 transition-opacity"
                >
                  关于
                </Link>
                <a
                  href="https://github.com/airobus/img-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
              {children}
            </main>
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
