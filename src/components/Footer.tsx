export default function Footer() {
  const links = [
    {
      name: "技术博客",
      url: "https://www.923828.xyz/projects",
      icon: "📚"
    },
    {
      name: "AI工具集",
      url: "https://ai.923828.xyz/flux",
      icon: "🤖"
    },
    {
      name: "开发者社区",
      url: "https://www.923828.xyz/community",
      icon: "👥"
    }
  ]

  return (
    <footer className="mt-12 py-8 border-t border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* 左侧版权信息 */}
          <div className="text-sm text-[var(--text-secondary)]">
            © Copyright airobus, Created with Cursor
          </div>
          
          {/* 右侧链接 */}
          <div className="flex flex-wrap gap-6 justify-end">
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                <span>{link.icon}</span>
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
} 