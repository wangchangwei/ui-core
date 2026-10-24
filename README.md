# Forma UI Core

Forma 是一个 React + MUI 的桌面企业后台脚手架。它把主题变量、应用布局、数据服务、权限和常见页面模式放在同一套可复制的约定中，供后续页面开发和 AI 协作使用。

## 快速开始

```bash
npm ci
npm run dev
```

打开 Vite 输出的地址。演示账号是 `admin@example.com` / `Demo123!` 和 `viewer@example.com` / `Demo123!`。管理员可以写入用户、项目和设置；Viewer 只读业务页面并可以编辑自己的资料。所有数据都是浏览器本地的版本化模拟数据，不代表真实认证或安全边界。

常用检查：

```bash
npm run lint       # 代码与设计约束
npm run typecheck  # TypeScript strict
npm test           # Vitest
npm run build      # 生产构建
npm run check      # 以上四项串行执行
npx playwright install chromium # 首次安装测试浏览器
npm run test:e2e   # Playwright，会自动启动/复用本地开发服务
```

## 目录约定

- `src/theme`：唯一的主题和设计 token 来源。
- `src/app`：应用壳、路由、导航、会话与反馈上下文。
- `src/shared`：页面布局、筛选、DataTable、状态、字段适配和确认对话框。
- `src/domain`：类型、schema、权限和异步模拟 API；页面不直接读种子数据或 localStorage。
- `src/features`：按业务页面组织的实现，只消费主题和共享组件。
- `docs/development.md`：新增列表、卡片、表单、详情、导航和后端替换的中文配方。
- `docs/page-standards.md`：表格列表、详情、卡片列表和表单页的统一实现契约。
- `DESIGN.md`：实际 token、页面结构、状态和无障碍规则。

业务页面不能直接引入 DataGrid、全局样式或 CSS 文件，也不能写硬编码颜色、字体、间距、圆角和阴影。`npm run lint` 会在 `src/features/**/*.{ts,tsx}` 中报告这些违规；共享主题和共享组件是受控例外边界。

登录后可从 `Resources` 的四个独立示例入口打开规范页面，查看四类可直接参考的页面实现；结构规则与开发指南保留在仓库文档中。

## 已知限制

首版只支持浅色桌面界面（基准 1440px，最低 1280px），使用本地模拟认证和数据，不包含移动端、深色模式、多语言、真实后端或生产级认证。宽表格在内容区域滚动；更窄窗口显示桌面使用提示。

## 使用与验收

需要 Node.js 22.12+；本次使用 Node 22.23.1。`npm ci` 按锁文件安装已核验的兼容版本。默认用户表格每页 25 条（可设 50/100）；项目卡片每页 9 条，保持三列节奏。浏览器刷新保留业务数据与设置，当前标签页保留演示会话。

`npm run test:e2e` 在 1280、1440、1920px 生成各页面家族截图，保存于 `artifacts/screenshots`；失败 trace 和截图在 `test-results`，HTML 报告通过 `npx playwright show-report` 查看。

设计参考：[Vercel 第三方设计分析](https://getdesign.md/vercel/design-md)。字体通过 Fontsource 本地打包，OFL 许可证随项目保存在 `public/licenses`。未发布到外部服务。

## 视觉基准

提供的原稿保存在 `docs/reference/DESIGN-vercel.md`，是颜色、排版、间距和形状的视觉基准。`DESIGN.md` 只记录后台组件映射与产品布局扩展；不能自行更改原稿 token。实现及验收见 `docs/vercel-alignment.md`。
