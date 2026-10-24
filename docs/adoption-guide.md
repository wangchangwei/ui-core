# 在其他项目中采用 UI Core

UI Core 是制定、演示和验证 UI 规范的源工程。下游项目要同时继承视觉 token、组件行为、页面模板和检查规则。当前交付形式为仓库源码与文档，`package.json` 为 private，尚无可安装的独立 UI Core npm 包。

## 选择接入方式

| 场景 | 接入方式 | 需要保留 |
| --- | --- | --- |
| 新建同栈后台 | 从本仓库模板或副本开始，替换演示业务 | 主题、shared、规范文档、检查规则和基础路由结构 |
| 已有 React + MUI 项目 | 在已有应用根部接入主题，逐步迁移共享组件及一种页面家族 | 现有业务数据与路由；按依赖图适配组件，不直接复制所有 app/domain |
| 不同技术栈 | 采用视觉与交互契约，重新实现对应组件并验收 | token 值、页面结构、状态和无障碍要求；React 实现不能直接复用 |

## 规范阅读顺序

1. [设计源稿](reference/DESIGN-vercel.md)：颜色、排版、间距、圆角、阴影的唯一视觉来源。
2. [后台设计映射](../DESIGN.md)：主题语义、布局、密度和交互扩展。
3. [组件契约](component-standards.md)：真实接口、状态责任与组合规则。
4. [页面规范](page-standards.md)：表格、卡片、详情和表单模板。
5. [开发配方](development.md)：domain → 服务 → 权限/路由 → 页面。

浏览 `/design-system` 查看组件样本；在 Resources 的四个 Example 中操作完整模板。Projects、Users、Scenarios 是规范的业务验证样例，其业务模型不要求被下游继承。

## 接入顺序与完成条件

| 步骤 | 操作 | 完成条件 |
| --- | --- | --- |
| 固定基线 | 记录采用的源仓库地址、commit、接入日期与本地差异 | 能定位后续修复应从哪个版本比较 |
| 根部主题 | 参考 `src/main.tsx` 安装 Geist 字体、ThemeProvider 和 CssBaseline | 按钮、标签、输入、focus 和表面使用本项目主题 |
| 共享层 | 迁入 `src/theme`、需要的 `src/shared` 与相应依赖 | DataTable 消费同一主题，FormField 有 RHF，离开保护运行在数据路由中 |
| 应用适配 | 将通知、导航、认证与权限接到下游应用的接口 | 菜单和直达路由权限一致，写权限在服务端执行 |
| 首个页面 | 选择最接近的四类模板，先接真实领域服务 | 加载、无结果、失败重试、分页、提交及权限状态完整 |
| 工程约束 | 接入 `tooling/eslint-rules.js`、`docs/style-exceptions.json` 与 ESLint 配置 | 目标业务目录受到相同规则约束；先修改路径匹配，不跳过检查 |
| 验收 | 执行检查与对应浏览器场景，记录结果 | 1280/1440/1920px、键盘操作及必要状态符合契约 |

MUI spacing 在此项目的基础值是 4px，`p: 6` 才是 24px；不得在默认 8px spacing 的主题下只复制组件 JSX。字体入口也必须一起迁移，否则字体指标会改变布局。

现有依赖版本和 Node 要求以根目录 package.json 与锁文件为准。新建项目使用 `npm ci`；已有项目先比较 React、MUI、DataGrid、RHF、Router 与 Zod 的兼容性，保留自己的锁文件并明确依赖差异。

## 最小应用根部

已有项目使用自己的路由和应用上下文，以下示意只展示主题安装：

```tsx
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';

export function AppRoot() {
  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppRouter />
  </ThemeProvider>;
}
```

`AppRouter` 代表下游项目自己的路由，不是 UI Core 提供的新 API。`useUnsavedChanges` 需要支持 blocker 的 React Router 数据路由；若采用其他路由器，适配同样的 Keep editing / Discard changes 与 beforeunload 行为。

## 交付给开发者或 AI 的任务约束

把以下要求放入下游项目现有开发说明，并调整实际文件路径：

> 开始页面开发前，阅读设计源稿、DESIGN.md、component-standards.md 与 page-standards.md。先选表格、卡片、详情或表单模板，再复用 theme/shared。业务页不直接引入 DataGrid、全局样式或 CSS，不写颜色、字体、圆角与阴影字面量。新字段先定义领域类型、schema 和服务接口；页面处理加载、空、无结果、错误重试、权限与适用的提交状态。完成时运行项目检查和受影响的浏览器场景，并报告真实结果。

AI 任务应给出资源类型、字段、权限、服务接口和页面家族。不要只给截图并要求“风格类似”，也不要让 AI 每页重新定义一套组件或生成配置驱动的通用页面。

## 下游采用记录模板

在下游项目记录下表；所有待填写项是接入信息，不代表本仓库已发布版本或已完成验收。

| 字段 | 接入项目填写 |
| --- | --- |
| UI Core 源仓库与 commit | 待填写 |
| 接入日期、负责人 | 待填写 |
| 复用资产与本地路径 | theme、shared、规范文档、lint 规则的实际路径 |
| 依赖差异 | 待填写 |
| 本地例外 | 精确路径、属性、值、原因 |
| 检查与浏览器证据 | 命令、结果、日期、必要截图 |

## 维护与升级

共性问题先在 UI Core 共享层修复，再同步相关下游；保留本地业务差异，不整目录覆盖。升级时比较基线 commit、主题、组件接口、文档与 lint 规则，并在代表页面重新验收。

改变接口、主题语义或默认交互时，变更说明必须包含受影响组件、调用方迁移步骤和验证证据。纯业务字段或权限差异留在下游 domain/app 层。

本项目当前边界为浅色、英文 UI、桌面最低 1280px。移动端、深色或多语言需求须先补规范及相应验收，再作为共享能力输出。演示认证、localStorage 数据与前端角色判断需替换为真实服务，不作为生产授权方案。
