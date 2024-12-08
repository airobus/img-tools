'use client'

import Link from 'next/link'
import { useState } from 'react'

interface MenuItem {
  name: string
  href: string
  enabled: boolean
  description: string
  icon: React.ReactNode
  bgColor: string
}

export default function Sidebar({ menuItems }: { menuItems: MenuItem[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`fixed left-0 top-0 h-full glass-effect border-r border-[var(--border)] z-10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo 和折叠按钮 */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)] justify-between">
        <Link
          href="/"
          className={`gradient-text hover:opacity-80 transition-opacity ${isCollapsed ? 'hidden' : 'text-xl font-semibold'}`}
        >
          图片魔方
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
            />
          </svg>
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className={`p-4 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className={`nav-item group ${isCollapsed ? 'px-2 justify-center' : ''}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl ${item.bgColor} flex items-center justify-center transition-all duration-300`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium group-hover:text-[var(--primary)]">
                        {item.name}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              ) : (
                <div
                  className={`nav-item opacity-50 cursor-not-allowed ${isCollapsed ? 'px-2 justify-center' : ''}`}
                  title={isCollapsed ? `${item.name} (即将推出)` : undefined}
                >
                  <div className={`${isCollapsed ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl ${item.bgColor} flex items-center justify-center transition-all duration-300`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-[var(--text-secondary)] mt-1">
                        即将推出
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* 底部版权信息 */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border)] ${isCollapsed ? 'hidden' : ''}`}>
        © 2024 图片魔方
      </div>
    </aside>
  )
} 