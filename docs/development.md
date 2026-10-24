# 开发配方

开始前同时阅读 DESIGN.md 与 docs/reference/DESIGN-vercel.md。后者是颜色、字体、间距、圆角和阴影的权威来源；DESIGN.md 只补充企业后台的页面结构、权限和状态约定。若两者冲突，按原稿 token 修正主题和共享组件，不在业务页另造一套值。

本文给出最短的新增页面路径。先看 `DESIGN.md` 与 [页面规范](page-standards.md)，再决定页面家族；不要为单个页面创建新的全局抽象。登录后的 `Resources` 四个独立示例入口与 Markdown 文档保持同步。

组件参数与状态责任见 [组件契约](component-standards.md)。在其他项目中采用本规范时，先执行 [项目接入指南](adoption-guide.md)，把主题、字体、shared 与检查规则作为共同基线迁入，再开发业务页面。

## 新增列表页

在 `src/features` 创建页面，使用 `PageLayout`、`FilterBar` 和共享 `DataTable`。筛选值放在页面状态中，筛选或排序变化时把页码设回 0；调用 `api.listUsers` 或 `api.listProjects` 处理分页、总数、加载、错误和重试。列定义只描述展示和行操作，DataGrid 类型从 `@mui/x-data-grid` 引入，运行时组件通过 `DataTable` 使用。写操作用 `can(session?.role, 'users:write')` 等现有权限检查包住。

## 新增卡片页

复用同一套 `PageLayout`、`FilterBar`、状态组件和分页模型。卡片使用 MUI `Card`，间距使用数字 token；不要写颜色或阴影字面量。空数据、无结果和失败状态使用页面公共状态组件，卡片操作按钮根据权限显示。

## 新增表单页

使用 React Hook Form 与现有 schema，字段保持明确而非配置驱动。外层用 `PageSection flush`，表单内用 `FormSection title description` 分组字段，最后使用 `FormActions hint` 放置取消和提交按钮。字段标签固定在输入上方，由主题统一实现；无需自行传入浮动标签样式。必填、邮箱和日期关系校验放在 schema；提交时禁用按钮并显示反馈，错误字段获得焦点。编辑表单在值变化后拦截未保存离开，保存成功后回到详情页。服务调用通过 `src/domain/api.ts`，页面不直接操作 localStorage。

## 新增详情页

用 `PageLayout` 和 `PageSection` 分组呈现状态、主要字段和关联资源。字段使用 `DetailRow label` 的定义列表语义，人员身份使用 `EntityAvatar`。读取失败可重试；没有关联资源时显示明确空状态。写操作按权限显示并要求确认，关联数据从 domain API 获取。

## 注册导航与权限

在路由定义处注册页面，在导航配置中增加同一权限键，确保菜单隐藏和直接访问拦截使用同一份 permission definition。Viewer 可读 Dashboard、Projects、Scenarios、Design System 与四类规范示例，并可以编辑自己的 Profile；管理页面直接访问时渲染 403。权限以 `src/domain/permissions.ts` 为准。

## 替换模拟服务

保留 `src/domain/api.ts` 导出的函数签名和返回类型，把函数体替换成 `fetch` 适配器。统一处理非 2xx、超时和 JSON 错误；页面、共享组件、权限与 schema 不需要改动。认证服务也应保持与演示 session 相同的接口，生产环境必须由后端完成真正的会话和授权。

## 验证

完成后运行 `npm run check`。新增交互至少覆盖登录回跳、权限边界、筛选回到第一页、删除确认、刷新后数据保留和失败重试；视觉检查在 1280、1440、1920px 下进行，并确认键盘焦点和弹窗焦点恢复。

## 可复制的读取骨架

以用户表格为例（替换领域类型和 API 即可新增同家族页面）：

```tsx
import { useState } from 'react';
import { TextField } from '@mui/material';
import { DataTable } from '../shared/DataTable';
import { AsyncState, FilterBar, PageLayout } from '../shared/ui';
import { useAsync } from '../shared/useAsync';
import { useApp } from '../app/AppContext';
import { api } from '../domain/api';

export function ExampleList() {
  const { settings } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const query = { search, page: page + 1, pageSize: settings.pageSize };
  const { data, loading, error, reload } = useAsync(() => api.listUsers(query), [query]);
  return <PageLayout title="Example list">
    <FilterBar><TextField label="Search" value={search}
      onChange={event => { setSearch(event.target.value); setPage(0); }} /></FilterBar>
    <AsyncState loading={!data && loading} error={error} onRetry={reload}>
      <DataTable rows={data?.items ?? []} columns={[{ field: 'name', headerName: 'Name', flex: 1 }]}
        rowCount={data?.total ?? 0} loading={loading} paginationMode="server"
        paginationModel={{ page, pageSize: settings.pageSize }} pageSizeOptions={[settings.pageSize]}
        onPaginationModelChange={model => setPage(model.page)} />
    </AsyncState>
  </PageLayout>;
}
```

UI 页码从 0 开始，模拟服务页码从 1 开始。实际列表如需用户选择每页行数，参考 `UsersPage` 中的 chosenPageSize；筛选/排序改变时同时清除选择。记录读取的依赖数组必须包含 id；不要用依赖为空的 effect 读取动态 id。

## 表单与详情的实际参考

- 简单字段、邮箱、枚举：复制 `UserFormPage` 的“加载父组件 + keyed editor”结构，避免旧记录的默认值残留。
- 多行文本、负责人、日期关系：参考 `ProjectFormPage`。等待必需的选项加载后再显示编辑器。
- `FormField` 传入 RHF 的 `control`、字段名、MUI 标签；用 `zodResolver` 校验，form 设置 `noValidate`，由 RHF 聚焦首个错误。
- 用 `isSubmitting` 禁用重复提交，成功后先 `allowNavigation()` 再跳转详情；留在原页保存时调用 `reset(saved)`。
- 用 `useUnsavedChanges(isDirty)` 并渲染返回的 `dialog`，同时处理应用导航、浏览器后退与刷新。
- 详情参考 `UserDetailPage` / `ProjectDetailPage`，关联字段可点击；Viewer 无权限的关联管理页显示文本。

## 新业务模块的落点

1. 在 domain 类型和 schema 中定义记录及输入。
2. 在权限联合类型与 can 的矩阵里登记权限，并在异步写入服务中检查。
3. 在 API 对象中增加类型明确的异步方法；真实接口替换时保留这些返回类型。
4. 在 app/router 中注册 lazy 页面及 Protected 权限，在 app/navigation 中登记同一权限的菜单。
5. 按现有示例实现筛选、表单、状态与操作。公共模式放 shared，数据规则放 domain，视觉变量放 theme。
6. 运行 check 与相关 e2e。不要向业务页引入 MUI 全局样式、直接 DataGrid、跨模块硬编码样式对象或 CSS 文件。

不把演示前端的权限判断当作生产安全边界；后端接入时由服务端认证、授权并校验所有写入，前端判断继续负责交互呈现。

## Vercel token contract

页面标题、正文、按钮和字段必须消费源稿 typography；颜色、边框、圆角和阴影必须消费源稿 token。卡片使用 12px 圆角、24px 内边距和细边框。视觉检查在 1280、1440、1920px 下进行，并同时核对 docs/reference/DESIGN-vercel.md；静态 lint 不能单独证明视觉一致。


## 新增资源目录/场景卡片页

查看 [Scenario Management 页面模板](scenario-management-template.md)，复用 `/scenarios` 的 `PageLayout`、全量类别计数、服务端式筛选分页、Cards/Graph 视图、批量导入 schema 校验和权限操作。所有后台业务页面统一填满可用工作区，保留左右 32px 内距；标题、说明、操作和分隔线统一由 `PageLayout` 提供。
