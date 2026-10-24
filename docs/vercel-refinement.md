# Vercel / Geist 视觉精修

当前分支：`codex/ui-framework`，技术栈继续使用 React + MUI。

## 目标与设计依据

本轮在现有后台功能上精修页面层级、材质、对齐、字段、卡片和图表。用户提供的 `docs/reference/DESIGN-vercel.md` 继续作为颜色、字体、间距、圆角和阴影的唯一权威来源。公开资料用于补充布局和交互原则，不替换源稿数值。

- [Geist Materials](https://vercel.com/geist/materials)：常规内容使用平面材质；菜单和弹窗才需要浮层阴影。
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)：刻意对齐、保留可见键盘焦点、明确加载状态、数字采用等宽对齐、避免 transition: all。
- [Geist Typography](https://vercel.com/geist/typography)：通过有限的排版层级区分标题、正文和辅助信息。项目仍保留源稿的 12/14/16/20/32/48 字号。
- [Geist Table](https://vercel.com/geist/table)：表格服务于比较、排序和操作，保持列对齐与明确的分页。
- [Geist Badge](https://vercel.com/geist/badge)：短状态文案、紧凑尺寸、不把标签做成按钮。
- [Geist Empty State](https://vercel.com/geist/empty-state)：说明当前状态并给出可执行的下一步。
- [Vercel Dashboard Navigation](https://vercel.com/changelog/dashboard-navigation-redesign-rollout)：侧栏负责稳定的工作区导航，顶栏提供当前位置与账户操作。

## 已落实的变化

- 登录：双栏布局、48px 标题、固定上方字段标签、成组的演示账号按钮；几何插图只使用原稿渐变和灰阶。
- 导航：工作区身份去掉重复边框；顶部使用白色平面，减少圆形控件和多余分隔；状态、账户与面包屑保持可读。
- 页面：统一标题和操作基线、标题下方细线、固定的内容间距。
- 表单：`FormSection` 提供说明列和字段列；`FormActions` 统一底部提示及操作；`FormField` 保留原有校验、关联标签和错误焦点。
- 表格：用户首字母头像、轻量行操作、统一筛选标签和搜索图标、结果数量、稳定的行高和分页。
- 项目：标识与状态在顶行，名称单独一行，描述固定两行，负责人和日期成组，详情操作独立底栏。
- Dashboard：真实业务指标、无多余点标记的折线、小环图、中心总数及带数量/占比的独立图例。
- 详情：`DetailRow` 提供定义列表语义；人物标识复用 `EntityAvatar`。
- 主题：关闭水波纹、保留明确的键盘焦点、32px 小型操作按钮；颜色、Geist 字体、控件 6px、卡片 12px/24px、对话框 16px 保持源稿契约。

本轮没有新增依赖、数据引擎或配置驱动表单。业务接口、权限、持久化和未保存离开保护沿用原实现。

## 检查与证据

检查结果完成后记录在 `docs/verification.md`。调整前截图位于 `artifacts/vercel-before`，当前三个桌面宽度的完整页面截图位于 `artifacts/screenshots`；截图由 Playwright 生成，不进入 Git。

查看 `DESIGN.md` 和 `docs/development.md` 可复用本轮共享组件及页面配方。静态检测和截图检查不等同于完整的 WCAG 审计；源稿的浅灰 placeholder 始终配有可读的固定标签。
