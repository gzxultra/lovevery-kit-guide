# Lovevery Fans 🧸

[![Website](https://img.shields.io/website?url=https%3A%2F%2Floveveryfans.com&label=loveveryfans.com)](https://loveveryfans.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)

> **Lovevery Fans** 是一个由 Lovevery 爱好者自发创建的非官方、非盈利社区指南，为中文家长提供完整的 Play Kit 使用说明和玩具详情。

**🌐 在线访问：** [loveveryfans.com](https://loveveryfans.com)

---

## ✨ 功能特性

### 📚 完整的 Kit 指南
- **22 个 Play Kit** 完整中英文双语指南
- **164 个玩具** 详细使用说明和发展目标
- 每个 Kit 的适龄范围、发展领域和玩具分类

### 👨‍👩‍👧‍👦 家长评价与实用建议
- **家长评价（优缺点）**：真实用户反馈，帮助您更好地了解每个玩具
- **清洗指南**：142 个玩具的材质标签和清洗建议
- **推荐码集成**：支持 Lovevery 官方推荐计划

### 🔍 强大的搜索与浏览
- **实时搜索**：按 Kit 名称或玩具名称快速查找
- **灯箱预览**：点击玩具图片放大查看细节，支持键盘导航
- **中英文切换**：一键切换语言，满足不同用户需求

### 🎨 优雅的用户体验
- **响应式设计**：完美适配桌面端和移动端
- **温暖的视觉风格**：蒙特梭利自然主义 + 斯堪的纳维亚极简主义
- **流畅的动画**：Framer Motion 驱动的交互动画

### 🛠 技术与 SEO
- **SEO 优化**：完整的 meta 标签、Open Graph、JSON-LD 结构化数据
- **Google Analytics**：GA4 集成，数据分析支持
- **Sitemap & Robots.txt**：搜索引擎友好
- **自定义域名**：loveveryfans.com（GitHub Pages 部署）

### 💬 社区互动
- **Formspree 留言反馈**：用户可以提交反馈和建议
- **打赏支持**：微信赞赏码 + Ko-fi 打赏

---

## 🚀 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2 | 前端框架 |
| **TypeScript** | 5.6 | 类型安全 |
| **Vite** | 7.1 | 构建工具 |
| **Tailwind CSS** | 4.1 | 样式框架 |
| **Framer Motion** | 12.23 | 动画库 |
| **Wouter** | 3.7 | 轻量级路由 |
| **Lucide React** | 0.453 | 图标库 |

---

## 📂 项目结构

```
lovevery-kit-guide/
├── client/                  # 前端源代码
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── contexts/        # React Context（语言切换）
│   │   ├── data/            # 数据文件（kits, toys, reviews, cleaning）
│   │   ├── pages/           # 页面组件（Home, KitDetail, NotFound）
│   │   └── index.css        # 全局样式
│   ├── public/              # 静态资源（图片、favicon、CNAME）
│   └── index.html           # HTML 模板
├── scripts/                 # 数据收集和处理脚本
│   ├── scrape_lovevery_official.py   # 爬取 Lovevery 官网数据
│   ├── scrape_reviews.py             # 收集家长评价
│   ├── scrape_cleaning_guide.py      # 收集清洗指南
│   ├── generate_toy_data.py          # JSON → TypeScript 转换
│   ├── requirements.txt              # Python 依赖
│   └── README.md                     # 脚本使用说明
├── dist/                    # 构建输出目录
├── vite.config.ts           # Vite 配置
├── package.json             # 项目依赖
└── README.md                # 项目说明（本文件）
```

---

## 🛠 本地开发

### 1. 克隆仓库

```bash
git clone https://github.com/gzxultra/lovevery-kit-guide.git
cd lovevery-kit-guide
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:5173` 查看网站。

### 4. 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

---

## 📊 数据收集脚本

`scripts/` 目录包含了一套完整的数据收集和处理脚本，用于从 Lovevery 官网、Reddit、Amazon 等平台收集数据并转换为网站可用的 TypeScript 格式。

详细使用方法请参考 [scripts/README.md](scripts/README.md)。

---

## 🚢 部署

本项目使用 **GitHub Pages** 部署，构建产物推送到 `gh-pages` 分支。

### 部署流程

```bash
# 1. 构建项目
pnpm build

# 2. 复制构建产物到临时目录
rm -rf /tmp/gh-pages-deploy && mkdir -p /tmp/gh-pages-deploy
cp -r dist/* /tmp/gh-pages-deploy/
cp client/public/CNAME /tmp/gh-pages-deploy/CNAME

# 3. 切换到 gh-pages 分支并清空
git checkout gh-pages
find . -maxdepth 1 -not -name '.git' -not -name '.' -not -name '..' -exec rm -rf {} +

# 4. 复制新构建产物并提交
cp -r /tmp/gh-pages-deploy/* .
echo "" > .nojekyll
git add -A
git commit -m "deploy: update site"
git push origin gh-pages

# 5. 切换回 main 分支
git checkout main
```

**⚠️ 重要提示：** 每次部署时，务必确保 `CNAME` 文件存在于 `gh-pages` 分支的根目录，否则自定义域名配置会丢失。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果您有任何建议或发现了问题，请通过以下方式联系我们：
- 在网站上使用 [Formspree 留言反馈表单](https://loveveryfans.com)
- 提交 [GitHub Issue](https://github.com/gzxultra/lovevery-kit-guide/issues)

---

## 💖 支持我们

如果这份指南对您有帮助，欢迎通过以下方式支持我们：

- ☕ **微信赞赏码**：访问网站底部查看
- ☕ **Ko-fi**：[ko-fi.com/ernie92368](https://ko-fi.com/ernie92368)

---

## 📄 免责声明

本网站由 Lovevery 爱好者自发创建，**非官方网站，非盈利导向**。所有 Lovevery 商标、产品名称和图片版权归 [Lovevery](https://lovevery.com) 所有。

This site is independently created by Lovevery enthusiasts. It is not affiliated with Lovevery and is non-commercial.

---

## 📜 许可证

MIT License

---

**Made with ❤️ by Lovevery Fans Community**
