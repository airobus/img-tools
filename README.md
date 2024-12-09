# 图片魔方

一套强大的在线图像处理工具集合，提供多种图像处理功能。永久免费，无需注册。

## 功能特性

- 图片压缩 - 高效压缩图片，保持最佳质量
  - 支持的格式：PNG, JPEG, WebP, HEIC
  - 最大文件数：50个
  - 压缩质量可调节（高、中、低）
  - 批量压缩和下载
  - HEIC 自动转换为 JPEG
  - 实时压缩进度显示
  - 压缩比例显示
  - 支持拖拽上传
  - 支持预览原图和压缩后的图片
  - 单个/批量下载功能
  - Favicon 获取 - 轻松获取网站图标
    - 支持多种获取方式
      - Google Favicon Service
      - DuckDuckGo Favicon Service
      - 网站根目录图标
    - 多种尺寸选项
      - 默认尺寸
      - 16x16 像素
      - 32x32 像素
      - 48x48 像素
      - 64x64 像素
      - 128x128 像素
    - 智能 URL 处理
      - 支持直接输入域名
      - 自动添加协议前缀
      - URL 格式验证
    - 实时预览功能
      - 即时显示获取的图标
      - 图标加载状态提示
      - 错误处理和提示
    - 便捷下载功能
      - 自动识别图标格式
      - 保持原始图标质量
      - 文件名包含尺寸信息

- SVG编辑器 - 在线编辑和预览SVG
  - 实时预览SVG效果
  - SVG代码格式化
  - 代码语法检查
  - 支持导出多种格式（SVG/PNG/JPG）
  - 智能缩进和换行处理
  - 单行SVG代码保持格式

- 图片尺寸调整 - 轻松调整图片大小
  - 支持拖拽上传图片
  - 实时预览调整效果
  - 保持宽高比例选项
  - 支持输入精确尺寸
  - 支持90度旋转图片
  - 旋转后保持设置的尺寸
  - 一键重置原始尺寸
  - 显示原始和调整后的尺寸信息
  - 支持常见图片格式（JPG、PNG、WebP等）
  - 保持图片质量的同时整尺寸
  - 支持下载调整后的图片
  - 简洁直观的操作界面

## 核心优势

- 永久免费：所有功能完全免费，无需注册登录
- AI 驱动：集成先进的 AI 模型，提供智能图像生成
- 简单易用：直观的界面设计，无需复杂操作
- 高效处理：先进的处理算法，快速完成图像处理
- 安全可靠：本地处理，保护您的图片安全

## 技术栈

- 框架：Next.js 13+ (App Router)
- 语言：TypeScript
- 样式：Tailwind CSS
- 包管理：pnpm
- AI 服务：
  - Silicon Flow API (图像生成)
  - Cloudflare AI (提示词优化)
- 数据存储：Firebase Firestore
- 图片处理：browser-image-compression
- HEIC 转换：heic-convert
- 文件打包：jszip
- 文件保存：file-saver

## SEO优化

- 完整的元数据配置
- 针对每个功能页面的专门描述
- 自动生成的站点地图
- 搜索引擎友好的URL结构
- 移动端适配优化
- 页面加载性能优化

## 开发进度

- [x] 项目初始化
- [x] 图片压缩功能
  - [x] 基础压缩功能
  - [x] HEIC 格式支持
  - [x] 批量处理（最多50个文件）
  - [x] 压缩进度显示
  - [x] 拖拽上传
  - [x] 压缩质量调节
  - [x] 智能跳过已优化图片
  - [x] 批量打包下载
  - [x] 单个文件下载
  - [x] 压缩比例显示
- [x] SVG编辑器功能
  - [x] SVG代码编辑器
  - [x] 实时预览功能
  - [x] 代码格式化工具
  - [x] 多格式导出（SVG/PNG/JPG）
  - [x] 智能代码缩进
  - [x] 单行代码优化
- [x] 图片尺寸调整功能
  - [x] 图片上传和预览
  - [x] 尺寸调整核心功能
  - [x] 宽高比例锁定
  - [x] 图片旋转功能
    - [x] 支持90度左右旋转
    - [x] 旋转时保持设置尺寸
    - [x] 重置时自动适应旋转角度
  - [x] 原始尺寸重置
  - [x] Canvas图片处理
  - [x] 图片下载功能
  - [x] 实时尺寸信息显示
  - [x] 错误处理和提示
  - [x] 响应式布局适配
  - [x] 拖拽上传支持
- [x] Favicon 获取功能
  - [x] 多服务获取支持
    - [x] Google Favicon Service
    - [x] DuckDuckGo Favicon Service
    - [x] 网站根目录图标
  - [x] 智能 URL 处理
    - [x] 自动添加协议前缀
    - [x] URL 格式验证
    - [x] 域名解析和处理
  - [x] 多尺寸支持
    - [x] 默认尺寸选项
    - [x] 16x16 到 128x128 可选
    - [x] 尺寸参数优化
  - [x] 图标获取和处理
    - [x] 多服务降级方案
    - [x] 超时和错误处理
    - [x] 内容类型验证
  - [x] 用户界面
    - [x] 实时预览功能
    - [x] 加载状态提示
    - [x] 错误信息展示
    - [x] 响应式布局
  - [x] 下载功能
    - [x] 自动识别文件格式
    - [x] 文件名优化处理
    - [x] 保持图标质量
- [x] 页面优化
  - [x] 统一的页脚组件
  - [x] 自定义Favicon
  - [x] 外部工具链接
  - [x] 响应式布局优化
  - [x] SEO元数据优化
  - [x] 站点地图生成
- [x] AI绘画功能
  - [x] 文本到图像生成
    - [x] 使用生图模型
    - [x] 支持自定义提示词
    - [x] 支持反向提示词
    - [x] 多种尺寸选项
      - [x] 方形 (1024x1024)
      - [x] 横幅 (1024x576)
      - [x] 竖幅 (576x1024)
      - [x] 宽幅 (768x512)
      - [x] 长幅 (512x1024)
      - [x] 高幅 (768x1024)
  - [x] 提示词优化
    - [x] 使用 Cloudflare AI 优化提示词
    - [x] 自动优化生成效果
    - [x] 失败时保留原始提示词
  - [x] 历史记录功能
    - [x] Firebase Firestore 存储
    - [x] 按时间倒序排列
    - [x] 显示生成参数
    - [x] 实时状态更新
    - [x] 分页加载更多
    - [x] 总数统计显示
  - [x] 图片详情页
    - [x] 大图预览
    - [x] 原始提示词展示
    - [x] 优化后提示词展示
    - [x] 反向提示词展示
    - [x] 创建时间显示
    - [x] 一键下载原图
  - [x] 用户界面
    - [x] 实时生成状态
    - [x] 进度条显示
    - [x] 分步骤进度展示
      - [x] 准备创作
      - [x] 优化提示词
      - [x] 生成图片
      - [x] 完成
    - [x] 错误处理和提示
    - [x] 响应式布局
    - [x] 图片卡片预览
    - [x] 悬浮效果和动画
    - [x] 快捷下载按钮
- [ ] Logo生成功能（计划中）

## 部署

本项目可以轻松部署到 [Vercel 平台](https://vercel.com)。

## 了解更多

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Learn Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

## 环境要求

- Node.js 16.x 或更高版本
- pnpm 8.x 或更高版本
- Firebase 项目
- Silicon Flow API 密钥
- Cloudflare AI 密钥

## 贡献指南

欢迎提交 Pull Request 或 Issue！

1. Fork 本仓库
2. 创建新分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
