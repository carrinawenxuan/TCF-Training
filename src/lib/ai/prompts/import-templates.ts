/**
 * 供外部 AI（如 Claude/ChatGPT）解析 TCF 题目截图时使用的 Prompt 模板
 * 用户复制后粘贴到对话中，再上传截图即可获得 JSON
 */

export const IMPORT_PROMPTS = {
  listening: `你是 TCF 法语考试题目数据化专家。我给你一张听力题截图。

请输出严格的 JSON 格式（不要 markdown 代码块）。

要求：
1. 根据题目和选项，合理推测并编写完整的音频对话文本（audioText）
2. 为对话分段并加中文翻译（transcript）
3. 必须包含 assist 字段（用户是 A1 水平，需要详细辅助）

JSON 结构：
{
  "id": "CO-套题号-题号",
  "module": "CO",
  "level": "A1/A2/B1/B2",
  "tags": ["标签"],
  "knowledgePoints": [],
  "difficulty": 1-10,
  "source": "screenshot_import",
  "status": "approved",
  "sourceNote": "来源描述",
  "audioText": "完整法语对话",
  "audioConfig": { "voiceId": "", "speed": 1.0, "language": "fr" },
  "transcript": [
    { "start": 0, "end": 5, "text": "法语", "translation": "中文" }
  ],
  "question": "法语题目",
  "options": [{ "id": "A", "text": "..." }],
  "correctAnswer": "X",
  "explanation": "中文详细解析",
  "distractorAnalysis": { "B": "中文", "C": "中文", "D": "中文" },
  "assist": {
    "questionTranslation": "题目中文翻译",
    "optionTranslations": ["A翻译", "B翻译", "C翻译", "D翻译"],
    "passageTranslation": "对话整体中文翻译",
    "wordByWord": [{
      "sentence": "关键句",
      "words": [{ "french": "词", "meaning": "义", "pos": "词性", "isKey": true }]
    }],
    "grammarNotes": [{
      "pattern": "语法点",
      "explanation": "中文解释",
      "example": "例句",
      "exampleTranslation": "例句翻译",
      "level": "A2"
    }],
    "keyVocabulary": [{
      "word": "词",
      "meaning": "义",
      "pos": "词性",
      "example": "例句",
      "exampleTranslation": "译",
      "frequency": "high"
    }]
  }
}`,

  reading: `你是 TCF 法语考试题目数据化专家。我给你一张阅读题截图。

请输出严格的 JSON 格式（不要 markdown 代码块）。必须包含 assist 字段（用户是 A1 水平）。

JSON 结构：
{
  "id": "CE-套题号-题号",
  "module": "CE",
  "level": "A1/A2/B1/B2",
  "tags": ["标签"],
  "knowledgePoints": [],
  "difficulty": 1-10,
  "source": "screenshot_import",
  "status": "approved",
  "sourceNote": "来源描述",
  "passage": "阅读文章法语全文",
  "passageType": "notice/email/ad/news/essay/letter",
  "question": "法语题目",
  "options": [{ "id": "A", "text": "..." }],
  "correctAnswer": "X",
  "explanation": "中文详细解析",
  "synonymMap": [{ "original": "原文词", "replaced": "选项替换词", "location": "段落" }],
  "assist": {
    "questionTranslation": "题目中文翻译",
    "optionTranslations": ["A翻译", "B翻译", "C翻译", "D翻译"],
    "passageTranslation": "文章中文翻译",
    "wordByWord": [{
      "sentence": "关键句",
      "words": [{ "french": "词", "meaning": "义", "pos": "词性", "isKey": true }]
    }],
    "grammarNotes": [{
      "pattern": "语法点",
      "explanation": "中文解释",
      "example": "例句",
      "exampleTranslation": "例句翻译",
      "level": "A2"
    }],
    "keyVocabulary": [{
      "word": "词",
      "meaning": "义",
      "pos": "词性",
      "example": "例句",
      "exampleTranslation": "译",
      "frequency": "high"
    }]
  }
}`,

  writing: `你是 TCF 法语考试题目数据化专家。我给你一张写作题截图。

请输出严格的 JSON 格式（不要 markdown 代码块）。必须包含 assist 字段。

JSON 结构包含：id, module: "EE", level, prompt, taskLevel: 1|2|3, wordRange: {min, max}, taskType, requiredPoints, formatRequirements, sampleAnswer, scoringRubric, assist（questionTranslation, keyVocabulary 等）。`,

  speaking: `你是 TCF 法语考试题目数据化专家。我给你一张口语题截图。

请输出严格的 JSON 格式（不要 markdown 代码块）。必须包含 assist 字段。

JSON 结构包含：id, module: "EO", level, scenario, taskLevel, prepTime, speakTime, guidedQuestions, sampleResponse, keyPhrases, evaluationCriteria, assist。`,
};

export type ImportPromptKey = keyof typeof IMPORT_PROMPTS;
