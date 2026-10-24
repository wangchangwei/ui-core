# 验收记录

验收范围：React + MUI 企业后台脚手架；仅浅色、英文界面、桌面 1280px 及以上。前端演示认证与本地模拟数据，不接真实后端。

## 自动检查

| 检查 | 结果 |
| --- | --- |
| ESLint（含设计约束） | 通过，零警告 |
| TypeScript strict | 通过 |
| Vitest | 11 个文件，50 项通过 |
| Vite 生产构建 | 通过，按页面拆分加载 |
| Playwright | 12 项通过 |
| 视觉与规范审查 | 原版验收完成；本次源稿对齐另有独立代码审查及截图检查 |

浏览器场景覆盖登录回跳、Viewer 深链越权、用户与项目新增/编辑/删除、刷新持久化、日期关系校验、未保存离开保护、防重复提交、筛选回到第一页、表格排序/分页/选择、关联用户删除保护、设置与账户菜单同步、脏设置重置、状态重试、弹窗键盘焦点及窄窗口提示。

单元/组件回归覆盖过期响应忽略、切换记录立即隐藏旧值、详情失败重试、负责人加载完成后显示表单、存储不可用时认证恢复提示、损坏数据、权限矩阵、唯一邮箱、原子批量删除与设计规则正反例。本次对比度测试改为验证实际正文、链接和状态深色文字与白色、页面、soft 背景的组合（16 项）。原稿 mute、faint、亮黄色保留原值，不宣称它们作为小字达到 AA；placeholder 使用 faint，同时保留可读字段标签。新增源稿契约测试核对全部 30 个颜色、7 个圆角、10 个间距值、11 组排版值及 MUI 映射。

## 截图证据

`artifacts/screenshots` 包含 48 张截图：15 个页面家族 × 1280/1440/1920px，加错误、悬停及焦点对话框状态。文件由测试生成并忽略 Git，可用 `npm run test:e2e` 再生成。

15 类视图：登录、Dashboard、用户列表、新建用户、用户详情、编辑用户、项目卡片、新建项目、项目详情、编辑项目、系统设置、个人资料、设计系统、403、404。页面矩阵同时检查文档横向溢出、页面异常与浏览器控制台错误。

原版交付曾执行静态设计检测器；本次使用源文件契约、ESLint、渲染样式断言和三个宽度截图检查，不能将其视作完整 WCAG 认证。本次具体证据及范围见 `vercel-alignment.md`。

## 审查修复与边界

- 详情/编辑加载失败增加重试，并通过共享 useAsync 取消过期响应。
- 记录变更后立即隐藏旧数据，编辑器按当前记录键挂载。
- 项目新建等待负责人数据；关联项目、负责人根据权限链接。
- 已确认的数据重置跳过旧表单的离开阻断。
- 对话框入场后定位安全操作并恢复触发控件焦点。
- 状态徽章使用行内元素，避免段落内嵌块元素的控制台错误。
- 演示账号与业务用户独立；所有前端权限只能展示交互，生产授权必须由后端实现。

非阻塞视觉备注：403/404 顶部面包屑沿用通用 Page 文案；页面标题和返回动作明确。色块样例的高度为结构尺寸，与表格行高不共享语义。项目卡片固定九项一页；系统默认分页设置作用于用户表格。

复用时更改应用默认名称及模拟存储键前缀，避免多个项目在相同本地域名/端口下共享演示数据。真实后端接入保持领域服务返回类型，删除示例数据实现即可。

## Vercel 原稿对齐

视觉基准现改为用户提供的 `docs/reference/DESIGN-vercel.md`。本次重新生成 48 张截图，并新增浏览器样式断言：标题/按钮/正文行高、输入边框及内边距、卡片 12px、弹窗 16px、营销 100px、分类 64px、圆形图标按钮。后台功能和桌面最低宽度保持原产品范围。

## 2026-10-24 — Vercel / Geist 视觉精修

本次在 `codex/ui-framework` 保留 MUI，精修登录、导航、Dashboard、表格、项目卡片、表单和详情页。说明与官方参考链接见 `vercel-refinement.md`。

最终验证：

- `npm run check`：ESLint 零警告、TypeScript strict、11 个文件共 50 项测试、Vite 生产构建全部通过。
- `npm run test:e2e -- --workers=2`：12 项全部通过；包含 1280/1440/1920 三种宽度及窄窗口提示。
- 扩展浏览器契约：固定标签在输入上方、Email → Password → Sign in 键盘顺序、按钮可见蓝色焦点、详情定义列表结构、危险操作文字颜色。
- Impeccable 手动静态检测执行一次，返回 `[]`。项目 `.impeccable/design.json` 与规范不同步是既有辅助文件状态，本轮以 DESIGN.md 和源稿契约为准。
- 独立审查发现的详情定义列表嵌套已修复；回归测试发现的 Typography 默认标题语义已修复。未通过放宽断言规避问题。
- 原稿 SHA-256 保持 `12d363de1be5656965c0dffc127dab1763d44970d0caf86feee887ad46073127`。

最新执行日志保存在 `artifacts/vercel-refinement/`。调整前的 1440px 截图在 `artifacts/vercel-before/`，当前页面截图在 `artifacts/screenshots/`。人工对比检查覆盖登录、仪表盘、用户表格、项目卡片、表单、详情、个人资料和设置；自动矩阵覆盖全部 15 类页面，无页面横向溢出和浏览器错误。

边界：桌面 Chrome 验证，未单独执行 Edge；前端本地模拟认证/数据；不支持移动端和深色模式；不是完整的无障碍认证。业务接口与依赖版本没有改变。

## 2026-10-24 — Scenario Management 模板

新增 `/scenarios` 卡片目录模板及中文复用规范，参考用户提供的 Scenario Management 页面结构，并遵循 `docs/reference/DESIGN-vercel.md` 现有视觉契约。`artifacts/screenshots/1280-scenarios.png`、`1440-scenarios.png` 和 `1920-scenarios.png` 是最终检查截图；三个宽度均通过页面横向溢出检查。卡片分页标签的重复浮动标签问题已修正。

- `npm run check`：ESLint 零警告、TypeScript strict、11 个文件共 52 项测试、Vite 生产构建全部通过。
- `npm run test:e2e -- --workers=2`：14 项通过；覆盖场景搜索/分类、Graph 视图、预览、创建、JSON 导入、删除确认、Viewer 只读权限，以及 1280/1440/1920 页面截图矩阵。
- `git diff --check` 通过；Impeccable 静态检测一次返回 `[]`。

前端持久化仍为本地演示存储；Graph 是场景与真实子流程名称的关系摘要，不包含可编辑的流程画布。

## 2026-10-24 — 场景目录 Impeccable 精修

本轮仅调整场景目录及其模板规范：结果计数合并到工具栏、搜索和视图控件底部对齐、全宽标题提供预览入口、重复装饰图标移除、卡片操作归入子流程行、时间使用时钟图标。Graph 子流程竖排并保持同排卡片分隔线对齐；新建弹窗使用 600px 上限，修复子流程逐字输入时逗号丢失的问题。

- `npm run check` 全部通过：ESLint 零警告、TypeScript、52 项测试和生产构建。
- `npx playwright test e2e/scenarios.spec.ts e2e/visual.spec.ts --workers=2`：6 项通过，包含三个桌面宽度、Viewer 权限、标题预览、清除搜索后的焦点恢复，以及逐字输入子流程后保存/预览。
- 人工截图检查覆盖 1280/1440/1920 的 Cards、1440 的 Graph 与新建弹窗。目录截图保存在 `artifacts/screenshots/*-scenarios.png`，关系图、弹窗和执行日志在 `artifacts/scenario-polish/`。
- 设计检测返回 `[]`，`git diff --check` 通过；未增加视觉 token 或依赖。

## 2026-10-24 — 后台标题与宽度统一

所有后台业务页以 `/scenarios` 为基准，共用填满工作区的 `PageLayout`、32/40 标题、14/20 说明、页头操作和分隔线。移除 AppShell 的 1200px 上限及场景页的独立 `wide` 布局，保留左右 32px 内距。登录与居中错误提示仍使用各自的专用结构。

`npm run check` 全部通过（52 项测试）；视觉 Playwright 4 项通过，覆盖 1280/1440/1920 及窄窗口提示。矩阵新增断言，逐个比较业务页与场景页的页头宽度、标题左边缘/顶部位置、字号和行高；全部通过，无页面横向溢出或浏览器错误。人工截图检查覆盖 Dashboard、新建用户和用户表格。日志保存在 `artifacts/layout-alignment/`。

## 2026-10-24 — Page standards 修复

修复数值圆角在 MUI sx 中被 shape.borderRadius 再次放大的问题：页面改为带 px 的主题 token 引用，lint 仅允许来自主题的单个插值，仍拒绝数字字面量和任意对象引用。规范图将父子分类分行展示，并标注静态样例，避免误认为可操作的业务列表。说明区在窄桌面使用两列；标签顺序与用户要求保持一致。

规范选择通过 URL 的 pattern 参数保留；Tab 与面板关联完整，规则与状态也纳入同一个面板。Viewer 不再获得用户管理入口，表单示例进入 Profile；详情示例通过 API 找到当前存在的项目，支持加载、错误重试和空目录回退。提供中文 Markdown 规范下载。文档移除不存在的共享组件引用，并修正列数与计数口径。

- `npm run check` 通过：Lint、TypeScript strict、53 项单元测试、生产构建。
- `npx playwright test e2e/page-standards.spec.ts --reporter=line`：7 项通过，覆盖 1280/1440/1920 的四个模板、圆角与溢出、键盘、刷新、Viewer 入口，以及 project-1 删除后的详情示例定位。
- 截图：`artifacts/page-standards-fixed/`；人工检查表格、卡片、详情、表单示意。Impeccable 检测返回 `[]`；`git diff --check` 通过。

范围：规范页的结构图为静态示意，交互入口打开现有业务页面；本次未给所有业务资源新增二级分类或标签数据模型。

## 2026-10-24 — 四类规范拆页与表格示例重做

根据浏览器标注，将四类规范拆为 `/page-standards/table-list`、`/detail`、`/card-list`、`/form`，Resources 各有独立入口；旧地址与 pattern 参数兼容跳转。应用侧栏的导航区域可独立滚动，短窗口下仍可到达全部入口，规范页的面包屑不再误显示 Details。

标注中的小号静态表格替换为真实 MUI 控件与共享 DataTable：一级/二级分类联动、标签/状态筛选、搜索与清除、单列排序、25/50/100 分页、选择、批量与行删除确认、详情、新增校验和重置。示例数据和查询封装在 `src/domain/page-standard-example.ts`，每个预览实例隔离，所有操作不修改业务数据；双击创建只产生一条记录。其他三类规范保留静态结构示意和对应业务页入口。

- `npm run check` 通过：55 项单元测试、Lint、TypeScript、生产构建。
- `npx playwright test e2e/page-standards.spec.ts e2e/visual.spec.ts --reporter=line --workers=2`：11 项通过。
- 浏览器回归覆盖四页导航与刷新、旧链接跳转、Viewer、分类与标签组合、空结果恢复、排序与分页复位、确认取消/删除、新增校验/防重及重置。
- 短窗口截图：`artifacts/page-standards-separated/`，尺寸 1280/1461/1920 × 630；全部业务页面矩阵覆盖 1280/1440/1920。检查无页面横向溢出，表格在自己的内容区处理宽列。
- Impeccable 检测返回 `[]`，`git diff --check` 通过。

## 2026-10-24 — 纯页面示例

移除四页外围规范页头、用途说明、结构清单、交互契约、状态清单、基础规则、下载区及静态缩略图，只展示实际页面。原聚合组件缩减为旧链接重定向；Resources 导航改为四个 Example 入口。开发规范保留在 docs/page-standards.md。

表格直接展示 PageLayout、分类、筛选、操作栏与共享 DataTable。卡片列表改用正常尺寸 Card 与真实查询、分页和删除确认。详情用 PageSection、DetailRow、关联资源和编辑入口。表单用 RHF、Zod、FormField、FormSection、FormActions，支持保存、校验、提交锁及未保存离开保护。四页通过领域示例服务读取数据，避免页面读取 seed 或存储。

`npm run check` 通过（55 项单元测试）；页面回归 9 项、全局视觉矩阵 4 项通过，共 13 项 Playwright。人工截图核对四页 1461px，自动覆盖 1280/1461/1920 × 630 和完整 1280/1440/1920 桌面矩阵。纯示例截图在 artifacts/page-examples-clean/。设计扫描返回 []，git diff --check 通过。

## 2026-10-24 — 全局点击宽度抖动

桌面 Chromium 有界面模式、1461×630 视口、16px 常驻滚动条下复现：基准 main 宽度 1213px；普通分类点击保持 1213px；打开 Select/Menu/Dialog 后变为 1197px，body 被 MUI 写入 padding-right:16px，同时 html 的 scrollbar-gutter:stable 仍占据滚动条空间，导致重复补偿。无界面 Chromium 隐藏视口滚动条，最初未复现；不能用仅 headless 的结果证明该场景稳定。

统一改为 html overflow-y:scroll，移除 stable gutter，让 MUI 锁定根节点并只补偿一次滚动条宽度。保留滚动锁定、模态焦点和关闭恢复，未逐页禁用 ScrollLock 或硬编码负边距。修复后上述 Select/Dialog 的 main 宽度均保持 1213px，body padding 为 0。

新增 e2e/width-stability.spec.ts，使用有界面 Chromium 与可测量的16px滚动条，逐帧采样 main 宽度，同时比较标题栏、侧栏、左边缘；覆盖普通分类、筛选下拉、账户菜单、创建弹窗、嵌套下拉、关闭恢复和短页面导航，并断言滚动锁定与焦点恢复。

npm run check 通过（55 项单元测试）；宽度回归、四页交互与桌面视觉矩阵共15项Playwright通过。git diff --check 通过。
