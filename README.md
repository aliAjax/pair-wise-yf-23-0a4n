# 舞台灯光编排模拟器

纯前端舞台灯光编排工具：维护灯具 DMX 配接、场景 Cue、时间轴和演出方案，并生成可交付的灯光执行单。灯具、场景、时间轴、方案和执行单均保存在浏览器 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后访问：<http://localhost:20113>

> 当前评审环境未安装 Docker CLI，因此未能在本机执行 `docker compose config`；仓库已提供 `.env`、`.env.example`、`frontend/Dockerfile` 和 SPA 所需 `nginx.conf`。

## 执行单业务规则

1. 在「执行单」页选择一个演出方案。
2. 系统按方案 `track_ids` 的时间顺序逐场生成：
   - 灯具编号/名称；
   - DMX 起址、通道数、占用编号区间；
   - 亮度百分比与 0–255 DMX 值；
   - 场景开始、持续、淡入、保持、层级和优先级。
3. 任一冲突存在时整单失败，不写入新执行单：
   - 同方案两盏启用灯具的 DMX 编号重叠；
   - 场景引用停用灯具；
   - 灯具已删除或未加入演出方案；
   - DMX 起址/通道数使占用范围超出 1–512；
   - 亮度超出 0–100；
   - 轨道缺失、重复或引用不存在/非 `READY` 场景。
4. 修正后再次点击「生成 / 修正后增量重算」：
   - 通过灯具、场景、轨道和方案成员的依赖指纹找出受影响场次；
   - 只重算受影响场次；
   - 未受影响场次从上一版原样复制；
   - 若仍有冲突，保留旧执行单，不生成新版本；
   - 若没有任何受影响场次，不创建新版本，页面明确提示现有执行单保持原样。
5. 「强制全量重算」会忽略增量判断并重新生成新版，历史版本仍保留在 IndexedDB。

## 本地开发方式

```bash
cd frontend
npm install
npm run dev
```

生产构建：

```bash
cd frontend
npm run build
```

## 访问地址或 CLI 示例

- 前端：<http://localhost:20113>
- 灯具布置：<http://localhost:20113/#/fixtures>
- 场景编辑：<http://localhost:20113/#/cues>
- 时间轴编排：<http://localhost:20113/#/timeline>
- 执行单：<http://localhost:20113/#/execution>
- 舞台预览：<http://localhost:20113/#/preview>

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite |
| 状态管理 | Zustand 独立 store |
| 本地持久化 | IndexedDB（localStorage 仅保存种子版本和当前方案选择） |
| 样式 | 原生 CSS |
| 路由 | Hash 路由（无后端路由依赖） |
| 后端 | 无 |
| 部署 | Docker Compose + Nginx |

## 项目目录结构

```text
frontend/src/
├── api/                  # IndexedDB 异步访问与种子初始化，按模型拆分
├── components/common/    # FixtureIcon、CueCard、TimelineRuler、StageCanvas 等
├── components/execution/ # 执行单视图、冲突面板、方案范围编辑器
├── constants/            # 枚举、日志模板、错误码/消息、执行冲突文案
├── constructors/         # 默认对象、表单对象和执行单对象构造
├── hooks/                # useTimelinePlayback、useDmxAddressCheck、数据加载 hooks
├── mocks/                # 初始本地数据
├── pages/                # 灯具、场景、时间轴、执行单、预览页面
├── router/               # 前端路由清单
├── services/             # 执行单校验、指纹、增量重算核心服务
├── stores/               # Fixture/Cue/Track/Project/ExecutionSheet Zustand store
├── types/                # 数据模型和执行单类型
└── utils/                # IndexedDB 封装、格式化、稳定指纹
```

## 核心数据模型

- **Fixture**：灯具编号、类型、舞台坐标、DMX 起址、通道数、通道模式、启用状态。
- **CueScene**：场景名称、灯具亮度表、淡入/保持、优先级、场景状态。
- **TimelineTrack**：场景引用、开始时间、时长、图层、锁定状态。
- **ShowProject**：方案标题、场馆、参与灯具 ID、参与轨道 ID、更新时间。
- **ExecutionSheet**：版本、来源指纹、依赖快照、重算场次、逐场灯具执行行。

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`。
- `FRONTEND_PORT`: 前端端口，默认 `20113`。

## Docker 部署说明

- Compose 文件顶层 `name: stage-light`，只编排 `frontend` 服务。
- 容器名为 `${COMPOSE_PROJECT_NAME:-stage-light}-frontend`。
- 端口映射为 `${FRONTEND_PORT:-20113}:80`。
- 前端构建产物由 Nginx 托管，`try_files $uri $uri/ /index.html;` 支持 Hash/History 入口刷新。
- 本项目是纯前端应用，运行数据保存在用户浏览器 IndexedDB，不使用服务端数据库卷。
- 端口占用时修改 `.env` 中端口后执行 `docker compose up -d`。
- 需要清空本地演示数据时，在浏览器开发者工具中删除 `stage-light-db` IndexedDB，以及 `stage-light-seed-version`、`stage-light-selected-project` 两个 localStorage 键。

## 枚举/常量出现位置清单

### FixtureType：PAR / SPOT / WASH / BEAM / STROBE

- 常量：`frontend/src/constants/FixtureType.ts`
- 类型：`frontend/src/types/FixtureType.ts`
- 模型引用：`frontend/src/types/Fixture.ts`
- 聚合文案：`frontend/src/constants/statusText.ts`
- 构造默认值：`frontend/src/constructors/FixtureConstructor.ts`
- 种子数据：`frontend/src/mocks/seedData.ts`
- 编辑筛选/表单：`frontend/src/pages/FixturesPage.tsx`
- 展示组件：`frontend/src/components/common/FixtureIcon.tsx`、`StageCanvas.tsx`

### CueStatus：DRAFT / READY / DISABLED / ARCHIVED

- 常量：`frontend/src/constants/CueStatus.ts`
- 类型：`frontend/src/types/CueStatus.ts`
- 模型引用：`frontend/src/types/CueScene.ts`
- 聚合文案：`frontend/src/constants/statusText.ts`
- 构造默认值：`frontend/src/constructors/CueSceneConstructor.ts`
- 种子数据：`frontend/src/mocks/seedData.ts`
- 执行校验：`frontend/src/services/executionService.ts`
- 冲突文案：`frontend/src/constants/ExecutionConflict.ts`
- 编辑表单：`frontend/src/pages/CuesPage.tsx`
- 展示组件：`frontend/src/components/common/StatusBadge.tsx`、`CueCard.tsx`

### ChannelMode：RGB / RGBW / DIMMER_ONLY / MOVING_HEAD

- 常量：`frontend/src/constants/ChannelMode.ts`
- 类型：`frontend/src/types/ChannelMode.ts`
- 模型引用：`frontend/src/types/Fixture.ts`
- 聚合文案：`frontend/src/constants/statusText.ts`
- 构造默认值：`frontend/src/constructors/FixtureConstructor.ts`
- 种子数据：`frontend/src/mocks/seedData.ts`
- 编辑表单：`frontend/src/pages/FixturesPage.tsx`
- 展示：灯具清单与执行单灯具信息。

## 为什么会牵一发动全身

执行单不是简单导出表格，而是同时依赖灯具配接、场景灯具亮度、时间轴顺序和方案成员范围。DMX 起址变化可能影响多个场次；场景状态或灯具启用状态变化会改变校验结果；时间轴顺序变化会改变场次序号。因此执行逻辑拆在类型、常量、构造器、服务、API、store、hook、组件和页面多个模块中，任何核心字段变化都需要跨模块同步。

## 验证结果

- `npm run build --prefix frontend`：通过。
- 执行服务 Node 冒烟验证：通过，覆盖首次生成、停用灯具失败、DMX 重叠失败、失败保留旧单、仅重算受影响场次、无变化不生成新版本。

## License

MIT
