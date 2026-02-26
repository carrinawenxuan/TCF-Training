# TCF 刷题训练系统 — 项目上下文（给 AI 用）

> **新开对话时**：请先读本文 + `docs/tcf-question-schema.md` 与 `docs/claude-project-instruction-v2.md`，再继续开发或修 bug。

---

## 项目是什么

- **TCF-Training**：TCF 法语考试全模块训练（听力 CO、阅读 CE、写作 EE、口语 EO），用户从 A1 冲 B2。
- **核心理念**：真题 → 错题分析 → AI 强化练习 → 间隔重复 → 记忆卡片。
- **两个约束**：① 题目来源混合（截图导入 vs AI 生成），需区分并优先真题；② 用户 A1，每题需「辅助理解层」（翻译、逐词、语法）。

---

## 真相来源（必须对齐）

- **题目 JSON 规范**：`docs/tcf-question-schema.md`（唯一真相，类型与校验都要跟它一致）。
- **给 Claude 的产出指令**：`docs/claude-project-instruction-v2.md`（截图→JSON 的 prompt）。
- **Cursor 修 bug/校验指南**：`docs/cursor-fix-guide.md`（按题型分支校验、错误/警告分色）。

**说明**：当前 `docs/` 在 `.gitignore` 中，若新环境/新对话没有 docs 目录，可从 .gitignore 去掉 `docs/` 再提交，或把上述文档复制到仓库内（例如根目录）以便 AI 能读到。

---

## 技术栈

- Next.js 14+ App Router、TypeScript 严格、Tailwind、Zustand、本地 JSON + localStorage、Claude/OpenAI、ElevenLabs、Vercel。

---

## 关键路径（已实现）

| 用途         | 路径 |
|--------------|------|
| 题目类型     | `src/types/question.ts`（含 Option、PassageType、WritingTaskType、distractorAnalysis 在 CE） |
| 校验器       | `src/lib/question-engine/validator.ts`（按 module 分支：CO/CE/EE/EO） |
| 导入页       | `src/app/import/page.tsx`（粘贴 JSON、解析、补全、加载示例题） |
| 预览组件     | `src/components/import/JsonPreview.tsx`（按题型 MultipleChoice/Writing/Speaking + AssistStatus） |
| 阅读练习     | `src/app/reading/practice/page.tsx` + `ReadingQuestion`、`AssistPanel`、`ClickableText` |
| AI 补全      | `src/app/api/ai/complete-assist/route.ts`、`src/lib/ai/prompts/question-explainer.ts` |
| 示例题       | `public/data/questions/reading/sample.json`、`src/data/questions/reading/sample.json` |

---

## 校验规则摘要（与 schema 一致）

- **通用必填**：id, module, level, tags, knowledgePoints, difficulty, source, status, sourceNote, explanation, createdAt, assist。
- **CO**：audioText, transcript, question, options, correctAnswer, distractorAnalysis；assist 需 optionTranslations、passageTranslation；keyVocabulary ≥3。
- **CE**：passage, passageType, question, options, correctAnswer, **synonymMap（≥1）**、**distractorAnalysis**；assist 同上。
- **EE**：**无** question/options/correctAnswer；prompt, taskLevel, wordRange, taskType, requiredPoints, formatRequirements, sampleAnswer, scoringRubric；assist 需 passageTranslation（范文翻译）、grammarNotes，**无** optionTranslations。
- **EO**：**无** question/options/correctAnswer；scenario, taskLevel, prepTime, speakTime, sampleResponse, keyPhrases, evaluationCriteria；assist 需 passageTranslation（引导问题翻译）、grammarNotes，**无** optionTranslations。
- **tags** 建议 2–5 个；**keyVocabulary** 至少 3 个。

---

## 已完成的 Phase 1

- 项目骨架、类型、按 module 的校验器、导入中心（JSON 粘贴 + 校验 + 补全 + 加载示例题）、Prompt 模板复制、AI 补全 API、AssistPanel/ClickableText、阅读选择题、Dashboard、错误/警告分色、写作与口语题校验与预览。

## 已完成的 Phase 2

- **ElevenLabs TTS**：`/api/tts/generate`（根据 `audioText` 生成 CO 音频），环境变量 `ELEVENLABS_API_KEY`、可选 `ELEVENLABS_VOICE_ID_FR`。
- **听力题**：`/listening` 入口、`/listening/practice` 练习页，`AudioPlayer`（支持 src 或 ttsText）、`ListeningQuestion` 组件，与阅读题一致的选项与辅助面板。
- **记忆卡片（SM-2）**：`src/lib/sm2.ts` 间隔重复算法，`src/lib/store/flashcard-store.ts` 存储与「从生词添加」；`/flashcards` 复习页（正反面翻转、忘记/困难/掌握/简单评分）；阅读/听力练习中点击生词可「加入卡片」。

---

## 下次对话可以怎么说

- “请按 PROJECT-CONTEXT 和 schema/instruction 文档继续开发 Phase 2。”
- “题目校验报错，请对照 docs/tcf-question-schema.md 和 validator 检查。”
