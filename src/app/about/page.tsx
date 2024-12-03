export default function AboutPage() {
  return (
    <div className="min-h-screen p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-medium tracking-tight">关于图片魔方</h1>
          <p className="text-xl text-[var(--text-secondary)]">
            让图片处理变得简单、高效、专业
          </p>
        </div>

        <div className="space-y-8 text-[var(--text-secondary)]">
          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">产品优势</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">简单易用</h3>
                <p className="leading-relaxed">
                  无需注册，无需下载软件，打开网页即可使用。支持拖拽上传，操作直观简单。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">智能压缩</h3>
                <p className="leading-relaxed">
                  采用先进的压缩算法，在保持图片质量的同时实现最大压缩比。自动识别已优化图片，避免重复压缩。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">批量处理</h3>
                <p className="leading-relaxed">
                  支持同时处理多达50张图片，节省大量时间。支持批量打包下载，文件管理更轻松。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">安全可靠</h3>
                <p className="leading-relaxed">
                  所有处理都在本地完成，无需上传服务器，确保您的图片安全。开源代码，透明可靠。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">功能特点</h2>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                支持 JPG、PNG、WebP、HEIC 等多种格式
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                智能压缩算法，保持最佳图片质量
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                HEIC 格式自动转换为 JPEG
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                压缩质量可调节，满足不同需求
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                实时压缩进度显示
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                支持批量打包下载
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">未来计划</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Logo 生成</h3>
                <p className="leading-relaxed">
                  即将推出智能 Logo 生成功能，提供多种风格模板，快速创建专业的品牌标识。支持自定义颜色、字体和布局，让您的品牌形象更具特色。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">AI 图像生成</h3>
                <p className="leading-relaxed">
                  计划接入先进的 AI 模型，通过文本描述生成独特的图像。支持多种艺术风格，满足创意设计需求。
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">更多功能</h3>
                <p className="leading-relaxed">
                  图片格式转换、图片编辑、背景移除等更多实用功能正在开发中，敬请期待。
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-medium text-[var(--text-primary)]">访问更多工具</h2>
            <p className="leading-relaxed">
              除了图片处理，我们还提供更多有趣且实用的在线工具：
            </p>
            <div className="flex flex-col gap-4">
              <a
                href="https://www.923828.xyz/projects"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white">
                  📚
                </div>
                <div className="flex-1">
                  <div className="font-medium group-hover:text-[var(--primary)] transition-colors">
                    技术博客
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    了解更多技术分享和使用技巧
                  </div>
                </div>
                <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 