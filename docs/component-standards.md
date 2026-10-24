# UI Core 组件契约

本规范供其他项目的开发者与 AI 使用。组件的视觉值以 [设计源稿](reference/DESIGN-vercel.md) 为准，后台映射见 [DESIGN.md](../DESIGN.md)，完整页面组合见 [页面规范](page-standards.md)。本文记录现有接口和调用方必须实现的行为，不替代源码类型。

## 资产与边界

| 资产 | 实现入口 | 消费方式 |
| --- | --- | --- |
| 主题、字体、尺寸与 MUI 变体 | `src/theme/index.ts`、`src/main.tsx` | 在应用根部安装主题与字体，业务页消费语义 token |
| 页面布局、表单、详情、状态、确认 | `src/shared/ui.tsx` | 使用明确的组件参数组合 |
| 数据表格 | `src/shared/DataTable.tsx` | 运行时导入共享 DataTable；DataGrid 只允许类型导入 |
| 异步读取、离开保护 | `src/shared/useAsync.ts`、`src/shared/useUnsavedChanges.tsx` | 由页面连接领域服务与路由 |
| 导航、会话、全局提交反馈 | `src/app` | 接入下游应用自己的路由、权限、认证与通知服务 |
| Card、按钮、输入、菜单、标签、提示 | 主题配置后的 MUI 组件 | 直接使用 MUI 与本项目主题；不是另有一套同名共享组件 |

主题和共享组件定义外观及通用交互；页面决定数据、查询、权限和操作结果；领域服务处理业务规则。演示数据不属于组件接口。

## 布局

| 组件 | 现有参数 | 调用方约定 |
| --- | --- | --- |
| `PageLayout` | `title`、`description?`、`actions?`、`children` | 每页一个；标题为 h1，主操作放 actions；表单保存放底部 |
| `PageSection` | `title?`、`description?`、`actions?`、`flush?`、`sx?`、`children` | 普通工作表面，默认 24px 内距；`flush` 交给表单或表格内部安排内距 |
| `FilterBar` | `children` | 搜索在前、常用条件在后、清除或批量操作靠后；输入有可见标签 |
| `FormSection` | `title`、`description?`、`children` | 明确的说明列与字段列；按业务含义分组 |
| `FormActions` | `hint?`、`children` | 左侧说明，右侧 Cancel → Save/Create；挂在真实 form 中 |
| `DetailRow` | `label`、`children` | 父级为 `Box component="dl"`；值允许换行，链接保持可访问 |

共享 `PageSection` 当前使用普通卡片的 12px 圆角。明确需要 16px 大面板时消费 `tokens.radius.large`；`tokens.radius.panel` 的实际值是 12px，不能仅凭变量名称推断尺寸。

## 数据表格 DataTable

适用于逐行比较字段、排序和批量选择。入口为 `/page-standards/table-list`，真实业务参考为 `UsersPage.tsx`。

`DataTable<R>` 接收 `DataGridProps<R>`。包装层提供行高 48px、表头 44px、默认 25/50/100 分页选项、文字与边框、空结果状态和内容区滚动。业务页不得用 `sx` 覆盖共享的密度、颜色、全局 `.Mui` 选择器和字体。

| 能力 | 调用方必须传入或处理 |
| --- | --- |
| 数据与标识 | `rows`、`columns`；每行稳定唯一的 `id`，或传 `getRowId` |
| 服务端分页 | `paginationMode="server"`、`rowCount`、受控 `paginationModel` 和 `onPaginationModelChange` |
| 服务端排序 | `sortingMode="server"`、`sortModel` 和 `onSortModelChange`；操作列设置 `sortable: false` |
| 多选 | `checkboxSelection`、`rowSelectionModel` 和 `onRowSelectionModelChange`；使用 include ids 模型 |
| 加载 | `loading`；保留表头和结果区结构；页面通过 AsyncState 提供错误重试 |
| 无结果 | 默认 noRowsOverlay；需要区分空库与无结果时，由页面提供 AsyncState 或明确的 overlay |
| 行操作 | 使用行 id 定位；图标按钮 `size="small"`、可读 aria-label、Tooltip；删除先确认 |

选择列表头是 50px 的专用列，取消其水平内距，让 40px checkbox 完整显示。普通表头与单元格仍保留 16px 水平内距；不得通过缩小 checkbox 修复裁剪。

UI 页码从 0 开始；`api.listUsers` 的页码从 1 开始，而页面规范示例服务从 0 开始。按服务契约转换，不对所有接口统一加 1。筛选、排序和每页数量变化时回到第一页并清理失效选择。删除末页最后一条后回到有效页。

## 卡片 Card 与详情面板

卡片是主题化 MUI `Card`、`CardContent`、`CardActions` 的组合，当前没有独立的共享 ResourceCard 接口。完整示例位于 `/page-standards/card-list`。

- 用 `article` 和 `aria-labelledby` 关联标题；标题采用 h2，分区中的独立示例可用 h3。
- 卡片为 12px 圆角、24px 内容内距、细边框；使用 `CardContent` 默认值，避免重新写像素样式。
- 顺序为标题与状态、摘要、分类或负责人等属性、独立操作底栏。摘要限制 2–3 行，详情入口提供完整内容。
- 卡片包含独立操作时，不把整个卡片做成链接；标题或底栏提供明确的查看入口。
- 同组卡片等高，常规目录最小宽度 264px、间隔 16px；完整网格规则见页面规范。
- 初次加载使用占位卡片；空目录给创建入口，无结果给清除筛选，失败给重试。只读角色不显示写操作。

大面板使用 16px 圆角 token 和同一套表面色。详情属性使用 DetailRow，不重新绘制标签和值两套网格。

## 表单与输入

`FormField<T>` 接收 RHF 的 `control`、类型化 `name`，以及除 `name/value/onChange/defaultValue/error` 外的 MUI TextField 参数。错误来自 RHF fieldState，优先于 helperText。父级使用 `useForm` 与 Zod resolver；字段默认值在 useForm 中定义。

输入标签固定在上方；不可用 placeholder 代替标签。高度约 40px、6px 圆角，错误与 focus 同时出现时保持错误标签和边框。使用真实枚举值，数字选项保留数字类型。

表单提交时校验并聚焦首个错误字段；提交期间禁用重复动作；保存失败保留输入并说明重试方式；保存成功后 `reset(saved)` 或按页面约定导航。唯一性、日期关系及授权必须在领域服务再次验证。

`useUnsavedChanges(dirty)` 返回 `dialog` 和 `allowNavigation()`。在支持 blocker 的数据路由中渲染 dialog；只有成功保存后的离开才调用 allowNavigation。留在页面保存时 reset 表单即可，不提前永久绕过后续脏状态保护。

## 语义、动作与反馈

| 组件或接口 | 使用契约 |
| --- | --- |
| `EntityAvatar` | `name`、`size?: 'small' | 'medium'`；中性首字母，28/40px，旁边保留可读名称 |
| `StatusBadge` | `status`；已注册 active/completed/planned/on-hold/invited/suspended/admin/editor/viewer；未知值显示中性文字，不自动获得业务含义 |
| MUI Button | 主操作 contained、次要 outlined、辅助 text；category 用 `aria-pressed` 表达当前选中；营销变体只用于营销语境 |
| MUI IconButton | 普通圆形按钮 40px；表格和顶栏 small 为 32px；必须有 aria-label，Tooltip 不能替代名称 |
| MUI Chip | 标签和已选条件；删除条件使用 onDelete；分类、标签、状态含义不可互换 |
| MUI Tabs | 受控 value；每个 tab 有对应 panel、稳定 id、aria-controls、aria-labelledby；切换结果可被键盘访问 |
| MUI Menu / Tooltip | 命名触发器，键盘可达；菜单关闭后恢复焦点；低频操作收进菜单 |
| `useApp().notify` | 演示应用的全局反馈；下游接入自身通知服务并保留成功/失败语义，不在共享组件发起业务请求 |

`ConfirmDialog` 参数为 `open/title/description/onClose/onConfirm`，可选 `pending/confirmLabel/destructive`。默认聚焦 Cancel；pending 禁止关闭与重复确认。调用方负责权限、提交锁、异步请求和异常反馈；对话框本身不执行删除。

## 状态责任矩阵

`AsyncState` 参数为 `loading/error/empty/emptyTitle/emptyDescription/emptyAction/onRetry/children`，优先级为 loading → error → empty → children。不要同时传入互相矛盾的状态。

| 情况 | 展示与恢复 | 责任方 |
| --- | --- | --- |
| 首次读取 | 结构或加载提示；不要短暂显示 0 条数据 | 页面 + AsyncState / DataTable |
| 同查询刷新 | 允许保留旧数据并显示更新状态 | 页面 + useAsync；查询变化时 useAsync 会清除旧查询数据 |
| 空数据 | 说明资源为空；有权限时提供创建动作 | 页面传 emptyAction |
| 无搜索结果 | 说明当前条件无命中，提供清除条件 | 页面，不等同空库 |
| 读取失败 | 局部错误、Retry，保留查询条件 | 页面传 error/onRetry |
| 权限受限 | 路由与菜单同一权限定义；页面隐藏写操作 | app + 领域服务；403 不转成空列表 |
| 提交中 | 按钮禁用、可读进度、请求锁 | 表单或动作处理函数 |
| 提交失败 | 保留输入、可恢复错误、可再次提交 | 页面 + 通知或 Alert |
| 提交成功 | 明确反馈，更新列表/计数或重置脏状态 | 页面 + 领域服务 |

## 组件验收与变更

组件变更要同步源码、本文和 Design system 样例。通用修复放共享层，例如全选框裁剪；业务特例按 [style-exceptions.json](style-exceptions.json) 精确登记。

验收包括正常、hover、键盘 focus、禁用、加载、空、错误及适用的只读/提交状态。桌面检查 1280/1440/1920px，窄屏按当前产品边界显示桌面提示。检查长标题、长邮箱、无摘要、最后一页删除和弹窗焦点恢复。

运行 `npm run check` 与受影响的 Playwright 场景。自动检查只覆盖已编码的约束，仍需检查真实渲染；失败必须区分组件回归与浏览器环境缺失。
