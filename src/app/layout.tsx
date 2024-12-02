import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Image Tools - 在线图像工具集',
  description: '提供图片压缩、Logo生成、AI生图等多种图像处理工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const menuItems = [
    { 
      name: '图片压缩', 
      href: '/compress', 
      enabled: true,
      description: '高效压缩图片，保持最佳质量'
    },
    { 
      name: 'Logo生成', 
      href: '/logo', 
      enabled: false,
      description: '快速生成专业的Logo设计'
    },
    { 
      name: 'AI生图', 
      href: '/ai-image', 
      enabled: false,
      description: '使用AI技术生成独特的图像'
    },
  ]

  return (
    <html lang="zh" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="flex h-full">
          {/* 侧边栏导航 */}
          <aside className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-[var(--border)] z-10">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
              <Link 
                href="/" 
                className="text-xl font-semibold gradient-text hover:opacity-80 transition-opacity"
              >
                Image Tools
              </Link>
            </div>
            
            {/* 导航菜单 */}
            <nav className="p-4">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <div key={item.href}>
                    {item.enabled ? (
                      <Link
                        href={item.href}
                        className="nav-item group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium group-hover:text-[var(--primary)]">
                            {item.name}
                          </div>
                          <div className="text-sm text-[var(--text-secondary)]">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="nav-item opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1">
                            即将推出
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* 底部版权信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border)]">
              © 2024 Image Tools
            </div>
          </aside>

          {/* 主内容区域 */}
          <main className="flex-1 ml-64 min-h-screen bg-[var(--background)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
