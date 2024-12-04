import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '图片魔方 - 在线图像工具集',
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
      name: 'SVG编辑',
      href: '/svg',
      enabled: true,
      description: '在线编辑SVG代码'
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
                图片魔方
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
              © 2024 图片魔方
            </div>
          </aside>

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
      </body>
    </html>
  )
}
