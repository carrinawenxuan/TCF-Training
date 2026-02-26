# TCF 刷题训练系统

TCF（Test de Connaissance du Français）法语考试全模块训练系统，面向 **A1 冲刺 B2** 的中国法语学习者。覆盖听力（CO）、阅读（CE）、写作（EE）、口语（EO）四大模块。

核心理念：**真题 → 错题分析 → AI 生成强化练习 → 间隔重复 → 记忆卡片**

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript（严格模式）
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据**: 本地 JSON + localStorage（用户数据）
- **部署**: Vercel

## 开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 项目结构（Phase 1）

- `src/app/` — 页面与 API 路由
- `src/components/` — 共享组件、导入、阅读、Dashboard 等
- `src/lib/` — 题目校验、AI 模板、Store、loader
- `src/types/` — 题目、用户、卡片等类型
- `src/data/` — 本地题目 JSON 与示例

## Phase 1 功能

- **题目导入中心** (`/import`)：粘贴 JSON、校验、解析、一键入库；**加载示例题**（从 `/data/questions/reading/sample.json`）；**补全缺失数据**（调用 `/api/ai/complete-assist`）；复制听力/阅读/写作/口语 Prompt 模板
- **阅读练习** (`/reading/practice`)：CE 选择题 + AssistPanel（翻译 / 逐词 / 语法）+ 可点击词汇
- **Dashboard**：模块入口、今日计划、连续天数、导入入口
- **AI 接口**：配置 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY` 及 `AI_PROVIDER` 后，可使用「补全缺失数据」与题目讲解

## 后续阶段

- **Phase 2**: ElevenLabs TTS、听力题、记忆卡片（SM-2）
- **Phase 3**: 错误分类、AI 讲解、强化题生成与审核、难度自适应
- **Phase 4**: 写作/口语、考试模式、数据分析

## 环境变量（后续接入 AI 时使用）

```env
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID_FR=
AI_PROVIDER=claude
```

详见 `docs/plans/2025-02-25-tcf-training-phase1.md`。
