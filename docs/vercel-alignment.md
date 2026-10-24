# Vercel 原稿执行记录

本次视觉基准为用户提供的 DESIGN-vercel.md，原样归档于 `docs/reference/DESIGN-vercel.md`。

原稿 SHA-256：`12d363de1be5656965c0dffc127dab1763d44970d0caf86feee887ad46073127`。原稿优先于项目映射说明，禁止另造一套视觉变量后只验证内部一致性。

## 已落实的映射

| 规则 | 实现 |
| --- | --- |
| 源稿完整变量 | `vercelTokens` 保留 30 个颜色、7 个圆角、10 个间距值、11 组字号/字重/行高/字距 |
| 应用主色 | ink #171717、canvas #fafafa、白色表面、body #4d4d4d、hairline #ebebeb |
| 标题和正文 | 页面 32/40、章节 20/28、展示 48/48、正文 14/20、说明 12/16 |
| 字体 | 本地 Geist Variable、Geist Mono Variable；正文无新增 13px 层级 |
| 功能按钮 | 14/20 字体、6px 圆角、0px/6px 内边距 |
| 营销按钮 | marketing / marketingOutlined：16/20 字体、100px 圆角、0px/14px 内边距 |
| 分类及图标按钮 | category：64px；IconButton：圆形、hairline 边框 |
| 输入 | 白色、hairline 边框、6px 圆角、8px/12px 内边距；hover ink、focus link |
| 卡片及弹窗 | 普通卡片 12px/24px 内边距；弹窗 16px；默认无阴影 |
| 浮层 | 2px 与 8px 分层软阴影，加 inset hairline；阴影透明度为明确的交互扩展 |
| 语义色 | success/info 使用源稿蓝色；错误及警告文字使用源稿 deep 层级 |
| 内容宽度 | 后台业务页面以场景管理页为基准，填满工作区并保留左右 32px 内距；源稿的 full 圆角用于导航链接 |
| 示例页 | 原始色板、完整排版层级、应用/营销/分类/圆形按钮及共享状态示例 |

颜色、间距和文字值由主题统一提供；业务页面不自行覆盖全局 MUI 样式。MUI 的主按钮及错误状态深浅值显式使用源稿色，不依赖自动生成的新颜色。

## 原稿解释与产品范围

- 原稿 label-sm.fontWeight 混入非数字内容；依据同文件排版层级表采用 500。归档原稿未修改，夹杂文字未作为指令执行。
- 源稿属于营销与应用共用的视觉语言。后台仍使用原计划的侧栏、导航、业务表格和表单；未增加营销网站或移动端支持。
- 侧栏 232px、顶栏 64px、最低桌面 1280px、控件约 40px、表格行 48px 属于已确认的后台尺寸扩展。
- 源稿没有完整定义 hover；当前状态样式使用源稿颜色，并遵守 reduced-motion。
- 原稿 mute、faint 和亮黄色并非适合正文的 AA 文本色。保留原色及其低强调用途；可读正文用 body，语义文字用 deep。placeholder 遵循 faint，并保留独立可读标签；不宣称所有源色都通过 AA。
- 品牌渐变的命名色值保留在主题中；后台没有营销 hero，不把渐变铺到业务内容。

## 验收证据

- `npm run check`：ESLint、TypeScript、11 个测试文件 / 50 项测试、生产构建。
- `npm run test:e2e`：12 项，包含所有既有交互、三种桌面宽度和新增的真实渲染样式断言。
- `src/theme/source.test.ts`：直接读取归档原稿，核对源值及 MUI 映射。
- `src/theme/contrast.test.ts`：检验真实文字使用组合，明确低对比原色的用途边界。
- `e2e/design-contract.spec.ts`：检查渲染后样式，包含主按钮 hover、字段、卡片、状态、按钮家族、弹窗。
- `artifacts/screenshots`：48 张当前截图；三种宽度的页面矩阵检查页面溢出、异常与控制台错误。
- 独立只读审查确认原稿归档与用户文件逐字节相同，未发现源稿对齐方面的阻塞问题。

截图人工检查覆盖登录、Dashboard、用户表格、项目卡片、表单及规范示例；不将自动化通过等同于整站所有视觉状态或完整 WCAG 认证。
