# Forma 页面规范

本文是四类后台页面模板的实现契约。界面仅展示正常尺寸、可操作的页面示例；用途、结构规则和验收说明保留在本文，不渲染进示例页面。视觉 token 仍以 `docs/reference/DESIGN-vercel.md` 为源，共享行为以 `src/shared/ui.tsx`、`src/shared/DataTable.tsx` 和主题为准。

| 示例 | 路径 | 主要参考文件 |
| --- | --- | --- |
| 表格列表 | `/page-standards/table-list` | `TableStandardExample.tsx` |
| 详情 | `/page-standards/detail` | `DetailStandardPage.tsx` |
| 卡片列表 | `/page-standards/card-list` | `CardListStandardPage.tsx` |
| 表单 | `/page-standards/form` | `FormStandardPage.tsx` |

四页在 Resources 下各有独立的 Example 导航。旧 `/page-standards` 及 `?pattern=` 链接继续兼容跳转。示例均通过 `src/domain/page-standard-example.ts` 的异步服务访问临时数据，刷新恢复初始数据；操作不修改工作区业务数据。表格使用共享 DataTable 和真实筛选控件；卡片支持分类、标签、搜索、排序、分页及删除确认；详情展示真实字段、关联资源与编辑入口；表单使用 RHF、Zod、共享字段/分组/操作栏，具有校验、保存反馈、脏状态保护和提交锁。卡片 → 详情 → 编辑通过 id 参数演示路由关联。示例保存留在当前表单并重置脏状态，示例间不共享临时写入；接后端时保留服务接口并替换数据实现。

## 使用顺序

1. 先判定页面家族：表格列表、卡片列表、详情或表单。同一个资源可以有列表、卡片目录、详情和表单四种入口，但每页仍只承担一种主要任务。
2. 阅读 `DESIGN.md` 与本文，再选最近的实际参考页：表格用 `UsersPage`，卡片用 `ScenarioManagementPage`，详情用 `UserDetailPage` / `ProjectDetailPage`，表单用 `UserFormPage` / `ProjectFormPage`。
3. 先定义 domain 类型、schema、权限和异步 API，再接页面。页面不得读取 seed 或 localStorage。
4. 采用共享 `PageLayout`、`PageSection`、`AsyncState`、`FilterBar`、`DataTable`、`FormSection` 和表单字段适配器。
5. 补齐加载、空数据、搜索无结果、错误重试、无权限、提交中、成功和失败状态。完成后运行 `npm run check` 与适用的 Playwright 场景。

## 四类页面共同契约

- **页头**：使用 `PageLayout`。标题 32/40，说明 14/20；主操作在右侧且与说明基线对齐；标题下 32px 后接细分隔线。标题、说明和内容宽度与 `/scenarios` 一致，填满侧栏外工作区，左右 32px 内距，不设内容最大宽度。
- **动作优先级**：一页只保留一个 `contained` 主操作；次要操作使用 `outlined` 或文本按钮；表格行内常用操作使用 32px 图标按钮，破坏性操作使用错误语义并要求确认。操作名称描述结果，例如 `Create user`、`Save changes`。
- **数据边界**：筛选、排序、分页、合计与持久化都经过领域服务。页面只保存交互状态；列表计数、分类计数和详情关联必须来自同一 API 数据。
- **状态**：首次请求、后台更新、空库、筛选无结果、失败重试、权限受限和提交中都要可区分。异步写入时禁用重复提交；成功后再刷新相关数据与计数。
- **无障碍**：所有输入有可见标签，操作有可读名称；键盘焦点清晰；图标按钮有 `aria-label`；弹窗有标题、Esc、焦点恢复；颜色之外还有文字或图标表达状态。
- **响应范围**：桌面 1280px 最低，1440px 设计基准，1920px 利用更宽工作区。宽内容在自身容器滚动，页面不得横向溢出；1280px 以下显示桌面提示。
- **视觉约束**：只用主题语义色、Geist 字体、4px 间距基准和已登记圆角。普通工作表面使用细边框；卡片 12px 圆角和 24px 内边距；浮层才使用克制的分层阴影。

## 一、表格列表页

适用于字段较多、需要逐行比较、批量选择或列排序的管理型资源。例如用户、订单、权限、任务和审计记录。

### 页面结构

```text
PageLayout header: Title + description                     Primary action
─────────────────────────────────────────────────────────────────────────
Category bar: All 128 | Marketing 42 › Campaigns 18 ...   Tags: ...
─────────────────────────────────────────────────────────────────────────
Search ________________  Category  [All ▾]  Status [All ▾]  Tag [All ▾]
                                                      Clear  Delete selected
─────────────────────────────────────────────────────────────────────────
Results / active filters                         Sort: Updated ↓
─────────────────────────────────────────────────────────────────────────
☐  Primary        Secondary     Category / Tags      Status      Updated  Actions
☐  ...            ...           ...                  ...         ...      ...
─────────────────────────────────────────────────────────────────────────
N results     Rows per page 25 ▾      ‹  1 / 6  ›
```

### 必备区域与顺序

1. **标题与页面操作**：`PageLayout` 提供资源名、说明和主操作。需要创建时把唯一的 `contained` 创建按钮放在这里；导入、导出等次级动作放在旁边。
2. **分类与二级分类**：分类栏位于页头分隔线和筛选控件之间。一级分类用可切换的分类入口；选中一级分类后，二级分类以缩进、分隔符或独立子栏呈现，不把两层层级压成同等胶囊。`All` 始终提供。分类数字来自完整数据集，不是当前页；多分类数据允许重叠计数。当前分类用 `aria-pressed` 表达。
3. **标签**：标签是跨分类的描述性属性。首层最多直接展示 3–5 个高频标签，其余放进 `All tags` 菜单或标签筛选；不要为了铺满工具栏列出全部标签。已选标签使用可移除 Chip 或可感知的选中状态。分类决定数据范围，标签只收窄范围，两者语义不能混用。
4. **搜索**：输入框位于筛选首行左侧，通常 280–360px；placeholder 说明搜索字段，例如 `Search by name, email or ID`。输入即筛选，需防抖或使用异步服务；清除按钮把焦点送回输入框。搜索触发后回到第一页。
5. **筛选**：搜索旁放 Category、Status、Tag、Owner 等最常用条件。筛选标签固定在上方，控件底边对齐。只在宽屏展开高频条件，其余通过 `Filters` 按钮打开面板；筛选面板使用复选框或页面内面板，不用大段下拉叠加。
6. **排序**：列头提供单列排序，箭头与 `aria-sort` 表示当前方向。独立的排序控件用于卡片列表或没有可点击列头的情况；排序改变后回第一页。默认排序必须在页面说明或排序菜单里可见，不要保留无法解释的数据顺序。
7. **操作栏**：页面级操作在右侧页头；批量操作在筛选区下方或结果汇总行；行级操作固定在末列。常用查看/编辑可直接露出，低频与破坏性操作收进 `More actions` 菜单。不可删除必须给出业务原因，例如有关联项目，不能只显示灰色按钮。
8. **结果区**：显示总数或当前范围；加载刷新时保留旧数据和可感知的更新状态。表格使用共享 `DataTable`，默认行高 48px，每页 25 条并提供 25/50/100。选中项跨操作保留；筛选、排序和分页变化时清除不再成立的选择。
9. **分页**：服务端分页；总数、页码和范围使用等宽数字。上一页/下一页无可用页时禁用。删除最后一页最后一行要回到有效页。
10. **空状态**：区分“无数据”和“无搜索结果”。无结果说明是筛选导致，并提供 `Clear filters`；无数据且用户有写权限时提供创建入口。

### 列与交互约定

- 第一列可放选择框，第二列放资源主标识（头像、名称、简短 ID），后续字段按“识别 → 分类/标签 → 状态 → 时间 → 操作”排序。
- 每列只承担一种信息层级；标签、状态、头像放在单元格组件内，不改变整个表格的行高。
- 表头可排序列使用单列排序；操作列不可排序。每行必须有唯一 ID，操作使用该 ID 定位记录。
- 宽表格在内容区横向滚动；首列和操作列不要同时使用浮动固定造成遮挡和键盘顺序混乱。
- 加载时显示骨架行或保留表格框架；不要用整页 spinner 覆盖已知表头。错误重试保留当前筛选；空状态和错误状态占据与服务结果相称的区域。

### 组合示意（需接入领域数据和处理函数）

```tsx
<PageLayout title="Users" description="Manage workspace members and access." actions={<Button variant="contained">Add user</Button>}>
  {/* 使用 MUI Button / Chip 组合一级分类、二级分类与标签筛选；目前没有 CategoryNavigation 组件。 */}
  <FilterBar>{/* Search, filters, active tags, clear */}</FilterBar>
  <Typography variant="body2">{data?.total ?? 0} results</Typography>
  <AsyncState loading={!data && loading} error={error} onRetry={reload}>
    <DataTable {...serverPaginationAndSorting}/>
  </AsyncState>
</PageLayout>
```

## 二、详情页

适用于查看单个资源的完整事实、状态、关联关系和可执行动作。

### 页面结构与规则

```text
← Users / Morgan Chen                  Status badge       Edit   More
PageLayout header: Morgan Chen
                   morgan.chen@example.com
─────────────────────────────────────────────────────────────────────────
Overview panel                         Relationship panel
Identity and core properties            Related records with empty state
─────────────────────────────────────────────────────────────────────────
Activity / audit / metadata
```

- **页头**：资源标题、可编辑的次级标识和状态；页面级 Edit、Delete 等操作放右侧。名称不做无意义重复。面包屑由 AppShell 提供，页面内不要再复制导航。
- **信息分组**：主体分为 Overview、Relationships、Activity 等有业务意义的 `PageSection`。字段用 `DetailRow` / `<dl>`，标签可预测、值允许换行；长文本保持正文行宽，URL、邮箱和 ID 使用可复制或可访问的链接。
- **状态与权限**：状态 `StatusBadge` 文字与图标并存。操作与路由共用权限定义；无写权限时隐藏写操作，但保留可读内容。删除要求确认，有关联数据时显示原因并阻止未处理的破坏操作。
- **关联资源**：展示可点击的关联项、负责人和日期；子列表同样需要加载、空、错误重试与权限。不要用前端拼出与 domain API 不一致的计数。
- **刷新与错误**：读取失败显示可重试的局部错误，避免误称资源不存在；只有 API 明确返回未找到时才显示 404。不要把 403 伪装成空数据。
- **无表单混入**：查看状态默认只读。可快速修改的单一状态若确有需要，要具备明确保存反馈和权限检查；多字段修改进入表单页。

### 组合示意（需接入领域数据和处理函数）

```tsx
<PageLayout title={entity.name} description={entity.identifier} actions={writable ? <EntityActions/> : undefined}>
  <AsyncState loading={loading} error={error} onRetry={reload}>
    <PageSection title="Overview">
      <Box component="dl" sx={{ m: 0 }}>
        <DetailRow label="Status"><StatusBadge status={entity.status}/></DetailRow>
        <DetailRow label="Owner"><EntityLink/></DetailRow>
      </Box>
    </PageSection>
    <PageSection title="Related work"><RelatedItems/></PageSection>
  </AsyncState>
</PageLayout>
```

## 三、卡片列表页

适用于以视觉识别、短摘要和分类浏览为主的资源，例如模板、场景、项目、方案和内容目录。若用户主要比较多个字段，优先用表格。

### 页面结构与规则

```text
PageLayout header: Scenario Management                              Import  Create
─────────────────────────────────────────────────────────────────────────
All 64 | Recruitment 5 | Onboarding 4 | ...   [selected category]
─────────────────────────────────────────────────────────────────────────
Search ________________________             Grid/List   Active tags   Sort ↓
─────────────────────────────────────────────────────────────────────────
┌ Card ──────────────┐ ┌ Card ──────────────┐ ┌ Card ──────────────┐
│ title       ⟳  ⋮  │ │ title       ⟳  ⋮  │ │ title       ⟳  ⋮  │
│ summary            │ │ summary            │ │ summary            │
│ category · tags    │ │ category · tags    │ │ category · tags    │
│ updated      View  │ │ updated      View  │ │ updated      View  │
└────────────────────┘ └────────────────────┘ └────────────────────┘
─────────────────────────────────────────────────────────────────────────
Range       Items per page 12 ▾       Previous   1 / 6   Next
```

1. **分类与标签**：与表格列表遵循同一层级定义。卡片目录优先展示一级分类，二级分类通过页头分类子栏或筛选器选择；标签作为卡片底部属性或可移除筛选，不用颜色替代文字。分类切换、搜索、标签和排序都回第一页。
2. **工具栏**：搜索左对齐，视图切换、结果数、排序和标签入口在右；控件底边对齐。只提供业务实际支持的视图，不创建无作用的开关。
3. **卡片网格**：桌面使用 CSS Grid；常规最小宽度 264px，gap 16px。以当前侧栏与内距计算，1280px 通常 3 列、1440px 通常 4 列、1920px 通常 5 列，1280px 不得出现卡片溢出或尴尬单列。相似卡片等宽等高，内容过长要限制行数并提供可访问的完整内容入口。
4. **卡片内部层级**：标题和主要操作优先；摘要 2–3 行；分类、标签、负责人和时间是次级信息；底部操作区用细线与主体分开。卡片用 `article` 与 `aria-labelledby` 关联标题；标题链接作为查看入口。卡片含独立操作时，不将整张卡片包装为链接或按钮，避免嵌套交互与焦点冲突。
5. **操作**：预览/查看详情是主路径。编辑、复制、可见性、删除放在卡片级菜单或底栏；破坏性操作必须确认。只读角色可以搜索、筛选、预览和翻页，不能看到有效却会失败的写按钮。
6. **分页**：卡片页可使用 12/24/48 等页面密度；展示当前范围，保留每页数量和页码。筛选结果少于每页数量时隐藏不必要的翻页控件但保留范围信息。
7. **空与错误**：空目录鼓励创建；无搜索结果提示清除搜索、标签和分类。加载时用卡片骨架，不用把页面瞬间塌缩成一行。

### 卡片内容模板

```text
[Category / icon]                      [visibility] [more]
Resource title, maximum two lines
One-to-three-line summary
Owner · tags · related count
Updated 2 hours ago                View details
```

不把每张卡片做成“图标 + 大数字 + 装饰渐变”。图标只帮助识别资源类型；状态、分类与行动仍由文字表达。

## 四、表单页

适用于创建或编辑明确业务字段。所有字段先有 domain schema 与 API，再由页面渲染；不建设配置驱动或通用表单生成器。

### 页面结构与规则

```text
PageLayout header: New project
                   Capture ownership, timing and delivery status.
─────────────────────────────────────────────────────────────────────────
Section title             Field column
Short explanation         ┌ label ┐
                          [ input ]
                          helper / error
─────────────────────────────────────────────────────────────────────────
Section title             Field column
Short explanation         [ field ] [ field ]
─────────────────────────────────────────────────────────────────────────
Hint: required fields      Cancel   Create project
```

1. **页头**：创建/编辑标题和目的说明；页面级操作不应重复放入页头，保存动作固定在表单底部。详情编辑的取消路径返回所属资源页。
2. **分组**：使用 `FormSection` 按业务含义分组，说明列与字段列形成稳定两栏。字段顺序与用户任务一致：识别信息 → 操作/归属 → 分类/标签 → 时间或其他细节。不要把全部字段塞进一张通用网格。
3. **标签与输入**：标签固定在上方，14/20 且字重 500；控件高度约 40px，6px 圆角。placeholder 只补格式示例，不得替代标签。必填使用 `required` 语义；帮助文本解释约束，错误文本说明修复方法。
4. **校验**：React Hook Form + Zod，提交时校验，字段失焦或用户修正后及时消除错误；焦点移动到首个错误字段。日期相互依赖、唯一性和服务端业务规则必须在 domain/schema 或 API 再校验，不能只靠 UI。
5. **状态**：提交按钮显示进行中状态并禁用；保存成功显示确认并跳转或重置脏状态；失败保留用户输入，显示可恢复错误。禁止重复提交，快速双击也只产生一次写入。
6. **未保存离开**：初次值没改时不拦截；改变后覆盖取消、应用内导航、浏览器后退和刷新。对话框提供 Keep editing 与 Discard changes，且焦点可恢复。
7. **只读与权限**：禁止未授权路由，字段级只读只用于确有管理员管理的值并显示原因。Viewer 的表单动作与路由同时受限。
8. **取消与保存**：底部区域左放约束提示，右侧按 `Cancel` → `Save/Create` 排列。主按钮文案描述动作，不用泛化的 `Submit`。默认按钮不可在表单有效变化前误启用。

### 组合示意（需接入领域数据和处理函数）

```tsx
<PageLayout title="New project" description="Capture ownership, timing and delivery status.">
  <PageSection flush>
    <form noValidate onSubmit={handleSubmit(submit)}>
      <FormSection title="Project details" description="Give the initiative a clear name.">
        <FormField control={control} name="name" label="Name" required/>
      </FormSection>
      <FormActions hint="Required fields are marked with *">
        <Button type="button">Cancel</Button>
        <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create project'}
        </Button>
      </FormActions>
    </form>
  </PageSection>
</PageLayout>
```

## 分类、二级分类与标签模型

在 domain 类型中明确三个概念，页面不得相互代替：

```ts
type Category = { id: string; label: string; parentId?: string };
type Tag = { id: string; label: string };
type Item = { categoryId: string; tagIds: string[] };
```

- 一级分类负责数据所在的顶层目录；二级分类只属于一个父分类，展示时保留路径，例如 `Recruitment / Interview`。
- 标签是可复用的多值属性，跨分类使用；筛选语义是 AND 或 OR 要在规范中明确。默认多选分类按 OR、多个维度按 AND、标签多选按 OR。
- 分类与标签计数默认来自完整目录，不受当前页、搜索和筛选限制；结果总数反映当前查询。若展示当前搜索命中数，必须明确命名并由 API 分别返回，不能与全量目录计数混用。
- 分类和标签的增删改属于配置流程；若本轮没有实现管理入口，不在页面放无效的 `Manage categories` 按钮。

## 验收清单

- **页面**：1280 / 1440 / 1920px；标题、页头、表格、卡片、表单、弹窗与分页无遮挡；页面无意外横向滚动。
- **状态**：首次加载、刷新、空数据、无结果、错误重试、只读、提交中、提交失败和成功。
- **交互**：搜索和所有筛选回第一页；排序与分页服务端一致；删除确认；重复提交被阻止；未保存离开确认；弹窗 Esc 与焦点恢复。
- **数据**：刷新后保存状态仍在；重置恢复演示数据；列表总数、分类计数、Dashboard 和详情一致；Viewer 菜单、路由与 API 权限一致。
- **键盘与可读性**：Tab 顺序可预测，输入有标签，焦点可见，操作有名称，正文与状态文字满足对比度要求。

## 例外与维护

主题 token、MUI 全局覆盖和共享组件内部值只能在 `src/theme` / `src/shared` 维护。确有业务例外时，在 `docs/style-exceptions.json` 只登记精确文件和单个值，并说明原因；禁止整文件或整行关闭 lint。规范更新时同步检查本页、`DESIGN.md`、`docs/development.md` 和截图验收。
