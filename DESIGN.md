---
name: Forma UI Core
description: 基于 Vercel 设计分析、适配企业后台场景的 React + MUI 设计规范。
source: docs/reference/DESIGN-vercel.md
colors:
  ink: "#171717"
  on-ink: "#ffffff"
  body: "#4d4d4d"
  muted: "#8f8f8f"
  faint: "#a1a1a1"
  hairline: "#ebebeb"
  soft: "#f2f2f2"
  canvas: "#fafafa"
  elevated: "#ffffff"
  link: "#0070f3"
  link-deep: "#0761d1"
  link-soft: "#d3e5ff"
  error: "#ee0000"
  error-deep: "#c50000"
  warning: "#f5a623"
  warning-deep: "#ab570a"
  violet: "#7928ca"
  cyan: "#50e3c2"
  pink: "#ff0080"
  magenta: "#eb367f"
typography:
  display:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 48px
    fontWeight: 600
    lineHeight: 48px
    letterSpacing: -2.4px
  heading-lg:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: -1.28px
  heading-md:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
    letterSpacing: -0.4px
  label:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: -0.28px
  body:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-lg:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  caption:
    fontFamily: '"Geist Variable", sans-serif'
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  code:
    fontFamily: '"Geist Mono Variable", monospace'
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
spacing:
  unit: 4px
  values: [4px, 8px, 12px, 16px, 24px, 32px, 40px, 64px, 96px, 128px]
rounded:
  control: 6px
  card: 12px
  panel: 16px
  category: 64px
  pill: 100px
  full: 9999px
elevation:
  flat: "none"
  micro: "0 1px 1px rgb(0 0 0 / 4%)"
  layered: "0 2px 2px rgb(0 0 0 / 4%), 0 8px 16px -4px rgb(0 0 0 / 8%), inset 0 0 0 1px #ebebeb"
---

# Forma 设计规范

## Source of truth

docs/reference/DESIGN-vercel.md 是视觉 token 的唯一来源；本文只定义如何把这些 token 应用到企业后台。若本文与原稿冲突，以原稿为准，并同步修正 src/theme/index.ts、共享组件和验收脚本。原稿中的 label-sm.fontWeight 字段含有非 token 文本，本项目按其层级定义使用数值 500，不把该文本当作指令或设计值。

视觉基准为 Vercel 的浅色、黑白灰、Geist 字体、细边框与克制阴影。后台导航、表格、权限和模拟服务是产品功能扩展；它们不改变原稿的颜色、字体、间距、圆角和阴影 token。

## Colors

页面背景使用 canvas，卡片、输入和弹窗使用 elevated。主文字使用 ink，正文段落使用 body；muted 与 faint 仅用于禁用和装饰内容（placeholder 使用 faint；字段始终保留可读标签），不替代正文对比度。结构分隔使用 hairline，弱背景使用 soft。

链接、成功和信息状态的主色使用 link；可读文字使用 link-deep，悬停或深色强调仍使用原稿深色层级，选中背景可使用 link-soft。错误使用 error / error-deep，警告使用 warning / warning-deep；状态徽章和提示文字使用 deep，底色使用原稿 soft 层级。状态必须同时提供可读文字或图标，不能只依赖颜色。紫、青、粉和洋红仅用于图表或原稿定义的品牌渐变；业务页面不得自行增加颜色。

## Typography

Geist Variable 用于界面，Geist Mono 用于代码和大写 eyebrow（原稿仅定义这两类用途）。正文统一为 14/20；标签为 14/20、字重 500；标题使用原稿的 20/28 或 32/40 层级。display 的 48/48 仅用于需要展示级标题的场景，后台页面默认使用 32px 页面标题以保持信息密度，但不得创建新的字号 token。文本、按钮和字段标签使用主题变体，不在业务页面写局部字号或字重。

## Layout

原稿的内容宽度约为 1200px；后台内容区在此基础上保留左侧导航 232px、顶栏 64px、最小桌面宽度 1280px 和 1440px 设计基准。宽表格只在内容区横向滚动，页面本身不溢出；不添加移动端或营销页布局。

间距只使用 4px 基准中的 [4, 8, 12, 16, 24, 32, 40, 64, 96, 128]。MUI 数字间距直接映射到该基准。应用按钮最小高度 40px、水平内边距 6px；营销变体（如组件示例需要）使用 44px 高、14px 水平内边距和 pill 圆角。导航采用 full 圆角，表格行高约 48px 是后台密度扩展。

## Shapes & elevation

输入、按钮和导航控制使用 control 6px；普通卡片使用 card 12px、24px 内边距；大型面板和对话框使用 panel 16px。category、pill 和 full 只用于原稿定义的品牌或导航形状，不得把业务卡片全部做成胶囊。

默认表面使用细边框和 flat。极少数菜单、弹窗和浮层使用 micro 或 layered。不在业务页面写阴影字符串；阴影只能从主题或共享组件接口消费。

## Components

- AppShell：导航、面包屑、顶栏和账户菜单；导航状态使用 full 圆角和主题语义色。
- PageLayout / PageSection：统一标题、说明、操作区和内容区；标题层级消费 heading-lg 或 heading-md。
- FilterBar / DataTable：统一筛选、结果、分页和表格滚动；业务页面不直接引入 DataGrid。
- FormField：RHF 与 MUI 字段适配；输入使用白色表面、hairline 边框、6px 圆角和 8px/12px 内边距，hover 使用 ink，focus 使用 link。
- StatusBadge：共享语义色、文字和图标；成功映射蓝色 link，不创建绿色替代 token。
- ConfirmDialog / useUnsavedChanges：删除确认、未保存离开保护、焦点恢复和键盘操作。
- AsyncState：加载、空数据、搜索无结果、失败和重试状态。

源稿没有规定 hover 与 focus 的完整交互；本项目将它们作为后台可用性扩展，仍只能使用上述源稿颜色和 layered 阴影。所有写操作共享权限定义，提交期间禁用按钮，成功后反馈并重置脏状态。

## Do's and Don'ts

- 开始改动前先读本文和 docs/reference/DESIGN-vercel.md，确认页面属于列表、卡片、表单、详情或认证模板。
- 业务代码只消费 src/theme token、MUI 数字间距和共享组件；不要硬编码颜色、字号、圆角或阴影。
- 输入要有可见标签，正文达到可读对比度，焦点可见，弹窗支持键盘和焦点恢复。
- 保持公共组件与主题同步；若源稿 token 变化，先改 token，再更新组件和截图验收。
- 不创建配置驱动的通用页面生成器，不用 eslint-disable 绕过约束；例外写入 docs/style-exceptions.json。
- 静态检查不能代替视觉、键盘和状态验收；在 1280、1440、1920px 检查页面族和弹窗。
