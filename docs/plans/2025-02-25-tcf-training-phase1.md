# TCF 刷题训练系统 Phase 1 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 完成题目导入中心（JSON 粘贴 + 校验 + 自动补全）、阅读选择题模块（含完整 AssistPanel）、可点击词汇、以及基础 Dashboard。

**Architecture:** Next.js 14 App Router + TypeScript 严格模式；题目与用户数据存本地 JSON + localStorage；导入流程为「粘贴 JSON → 校验 → 补全 assist → 入库」；做题页统一包含 AssistPanel，根据用户 assistMode 与题目 level 控制辅助展示。

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Zustand, 本地 JSON 文件。

---

## Phase 1 任务清单

### Task 1: 项目骨架与类型定义
- Create: `src/types/question.ts`, `src/types/user.ts`, `src/types/flashcard.ts`, `src/types/knowledge-point.ts`, `src/types/training-session.ts`
- Create: `src/app/globals.css`（含设计 token）, `src/app/layout.tsx`, `src/app/page.tsx`（占位 Dashboard）

### Task 2: 题目校验器与来源/状态逻辑
- Create: `src/lib/question-engine/validator.ts`（ValidationResult、必填/建议字段、source/status 自动设置）

### Task 3: 导入中心页面与 JSON 粘贴
- Create: `src/app/import/page.tsx`, `src/components/import/JsonPreview.tsx`, `src/components/shared/Navbar.tsx`
- 粘贴 JSON → 解析 → 调用 validator → 显示解析结果与缺失项

### Task 4: Prompt 模板与复制功能
- Create: `src/lib/ai/prompts/import-templates.ts`（listening/reading/writing/speaking 四类）
- Modify: `src/app/import/page.tsx` — 增加「复制 Prompt 模板」按钮

### Task 5: 辅助数据自动补全 API
- Create: `src/app/api/ai/explain/route.ts`（题目讲解）, `src/lib/ai/prompts/question-explainer.ts`
- Create: `src/app/api/ai/parse-screenshot/route.ts` 占位（可选）；补全逻辑可先走 explain 或单独补全接口

### Task 6: AssistPanel 与辅助组件
- Create: `src/components/shared/AssistPanel.tsx`, `src/components/shared/WordByWordView.tsx`, `src/components/shared/SentenceBreakdown.tsx`, `src/components/shared/GrammarTooltip.tsx`

### Task 7: ClickableText 与词汇浮窗
- Create: `src/components/shared/ClickableText.tsx`（preloadedVocab、浮窗、加入生词本入口）

### Task 8: 阅读模块与题目展示
- Create: `src/app/reading/page.tsx`, `src/app/reading/practice/page.tsx`, `src/components/reading/PassageViewer.tsx`, `src/components/reading/ReadingQuestion.tsx`, `src/components/reading/HighlightableText.tsx`
- 阅读题必须渲染 AssistPanel + ClickableText

### Task 9: 题目存储与加载
- Create: `src/lib/question-engine/loader.ts`, `src/data/questions/reading/` 目录与示例 JSON
- Create: `src/lib/store/question-store.ts`（Zustand，题目列表、按模块/等级筛选）

### Task 10: 用户 Store 与默认 AssistMode
- Create: `src/lib/store/user-store.ts`（UserProfile、AssistMode、getDefaultAssistMode、shouldForceFullAssist）

### Task 11: 基础 Dashboard
- Create: `src/components/dashboard/DailyPlan.tsx`, `src/components/dashboard/StreakCounter.tsx`, `src/components/dashboard/ModuleSelector.tsx`
- Modify: `src/app/page.tsx` — 集成上述组件，中文 UI

---

## Phase 2–4 概要（后续实施）

- **Phase 2:** ElevenLabs TTS、AudioPlayer、听力选择题、记忆卡片（SM-2）、错题生词→卡片
- **Phase 3:** 错误分类、AI 讲解、强化题生成、quality-gate、审核队列、难度自适应
- **Phase 4:** 写作/口语、考试模式、听写、同义替换、分析 Dashboard

---

## 验收

- 在 `/import` 粘贴符合规范的阅读题 JSON，能解析、校验、显示缺失、补全后入库
- 在 `/reading/practice` 能做阅读选择题，题目与选项支持 AssistPanel（翻译/逐词/语法）和 ClickableText
- Dashboard 展示模块入口、每日计划占位、连续天数
- 所有 UI 文案为中文
