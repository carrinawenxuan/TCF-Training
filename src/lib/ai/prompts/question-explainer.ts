/**
 * 题目讲解 / 辅助数据补全 — 供 AI 生成 questionTranslation、optionTranslations、
 * wordByWord、grammarNotes、keyVocabulary、explanation 等
 */

export const ASSIST_COMPLETE_SYSTEM = `你是 TCF 法语考试题目辅助专家。用户是 A1 水平中国学习者，需要完整的中文辅助数据才能做题。
请根据题目内容，输出一个 JSON 对象，且仅输出该 JSON，不要 markdown 代码块或前后说明文字。`;

export function buildAssistCompletePrompt(questionJson: string): string {
  return `${ASSIST_COMPLETE_SYSTEM}

当前题目 JSON（可能缺少 assist 部分或 assist 内部分字段）：
${questionJson}

请补全并输出「仅包含需要补全/覆盖的 assist 字段 + explanation」的 JSON，结构如下。若题目已有某字段且内容合理，可保留或略作优化。
输出格式（只输出这一层 JSON）：
{
  "questionTranslation": "题目中文翻译",
  "optionTranslations": ["选项A中文", "选项B中文", "选项C中文", "选项D中文"],
  "passageTranslation": "文章/对话整体中文翻译（若无 passage/audioText 则省略或空字符串）",
  "wordByWord": [
    {
      "sentence": "一句法语原句",
      "words": [
        { "french": "词", "meaning": "中文释义", "pos": "词性如 n.f. / v. / adj.", "isKey": true }
      ]
    }
  ],
  "grammarNotes": [
    {
      "pattern": "语法点名称",
      "explanation": "中文解释",
      "example": "法语例句",
      "exampleTranslation": "例句中文翻译",
      "level": "A1/A2/B1/B2"
    }
  ],
  "keyVocabulary": [
    {
      "word": "法语词",
      "meaning": "中文释义",
      "pos": "词性",
      "example": "例句",
      "exampleTranslation": "例句翻译",
      "frequency": "high"
    }
  ],
  "explanation": "本题中文详细解析（为什么选正确答案、干扰项为何错）"
}

注意：keyVocabulary 至少包含题目与选项中的 3～8 个关键词。wordByWord 至少覆盖题目句或文中关键句。grammarNotes 1～3 条即可。`;
}
