import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize the Gemini Client
// 💡 架构提示 (Architecture Note):
// 如果未来要迁移到国内模型 (如 DeepSeek):
// 1. 文本生成部分 (generatePrepOutline, generatePastorInsights) 可以轻松替换为 OpenAI 兼容接口。
// 2. 录音部分 (generateMeetingSummary) Gemini 具有原生多模态优势。
//    若换国内模型，需先调用 ASR (如阿里通义听悟) 转文字，再传给 LLM 总结。

// Safely access process.env (injected by vite.config.ts define)
const API_KEY = process.env.API_KEY;
const API_BASE_URL = process.env.API_BASE_URL;

// Debug logging visible in Browser Console (F12)
console.log(`%c[Tuesday Bible Hub] Config Check:`, "color: #4f46e5; font-weight: bold;");
if (API_KEY) {
  console.log(`✅ API Key: Detected (Length: ${API_KEY.length})`);
} else {
  console.log(`❌ API Key: MISSING (Undefined). Please check Vercel Env Vars.`);
}
if (API_BASE_URL) {
  console.log(`🌐 Base URL: Custom (${API_BASE_URL})`);
} else {
  console.log(`🌐 Base URL: Default (Google Official)`);
}

// Merge config properly
const clientConfig: any = { apiKey: API_KEY || "DUMMY_KEY_TO_PREVENT_CRASH_ON_INIT" };
if (API_BASE_URL) {
  clientConfig.baseUrl = API_BASE_URL;
}

const ai = new GoogleGenAI(clientConfig);

// Models
const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_MULTIMODAL = 'gemini-2.5-flash'; 
// 降级说明：原计划使用 gemini-3-pro，但 Google Free Tier 账号目前对 Pro 模型限制严格 (Quota: 0)。
// 改回 gemini-2.5-flash 以确保可用性。虽然模型变小，但配合深度 Prompt 依然能输出高质量内容。
const PASTOR_MODEL = 'gemini-2.5-flash'; 

/**
 * Helper to convert a File object to a Base64 string usable by Gemini
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 统一错误处理函数
 */
const handleGeminiError = (error: any): never => {
  console.error("Gemini API Error Details:", error);
  
  let userMessage = "发生了未知错误，请重试。";
  const errorStr = error.toString().toLowerCase();
  const errorJson = JSON.stringify(error).toLowerCase(); // Catch JSON object errors

  // 1. Check for missing key explicitly
  if (!API_KEY || errorStr.includes('api key must be a string') || API_KEY === "DUMMY_KEY_TO_PREVENT_CRASH_ON_INIT") {
     userMessage = "🔑 环境变量未读取到 (Missing API Key)。\n请检查：\n1. Vercel 后台 Environment Variables 是否已添加 API_KEY (Name就是API_KEY)。\n2. 是否添加了 vite.config.ts 配置文件。\n3. 添加后是否点击了 Redeploy (重新部署)。";
  } 
  // 2. Network / Proxy issues
  else if (errorStr.includes('fetch') || errorStr.includes('network') || errorStr.includes('failed to fetch')) {
    userMessage = "🚫 网络连接失败 (Network Error)。\n原因可能是：\n1. 中国大陆地区未开启 VPN。\n2. Vercel 部署未配置 API_BASE_URL 中转地址。";
  } 
  // 3. Quota Exceeded / Free Tier Limits (The error you encountered)
  else if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted') || errorJson.includes('quota')) {
    userMessage = "⚠️ 配额限制 (Quota Exceeded)。\nGoogle 免费版账号无法使用高级模型 (如 Pro 版)，或今日请求次数已达上限。\n\n技术调整：系统已自动切换至 Flash 轻量模型，请重试。";
  }
  // 4. Invalid Key (Google rejected it)
  else if (errorStr.includes('400') || errorStr.includes('invalid argument') || errorStr.includes('api key not valid')) {
    userMessage = "🔑 API Key 无效 (Invalid Key)。\n代码成功读取到了 Key，但 Google 拒绝了请求。\n请检查 Key 是否复制完整，或者该 Key 所在的 Google Cloud 项目是否欠费/被停用。";
  } 
  // 5. Server Errors
  else if (errorStr.includes('503') || errorStr.includes('overloaded')) {
    userMessage = "🐢 Google 服务暂时繁忙 (503)，请稍后重试。";
  } else {
    userMessage = `⚠️ 系统错误: ${error.message || errorStr}`;
  }

  throw new Error(userMessage);
};

/**
 * Generates the Leader Preparation Context
 */
export const generatePrepOutline = async (book: string, chapter: string): Promise<string> => {
  try {
    if (!API_KEY || API_KEY === "DUMMY_KEY_TO_PREVENT_CRASH_ON_INIT") throw new Error("API key must be a string"); 

    const prompt = `
      你是一位专业的《圣经百科全书》和《串珠汇编》助手。
      
      **用户目标**：
      用户是今晚查经的主领人。他**不需要**你告诉他这段经文的“感动”或“灵意”（这是他需要自己领受的）。
      他**需要**你帮他节省翻阅工具书的时间，快速提供客观的背景信息、生僻知识点和平行经文。

      请针对《${book}》第 ${chapter} 章，严格按照以下 Markdown 格式输出客观资料：

      # 📖 ${book} 第 ${chapter} 章：背景资料库

      ## 1. 历史与场景快照 (Context)
      * **时间/地点**：*（一句话概括当时的写作背景或事件发生地）*
      * **核心人物**：*（列出本章出现的关键人物，如果名字生僻，请简要注明身份）*
      * **关键风俗/物品**：*（如果经文里提到了特定的文化风俗或物品，请简要解释。如果没有，请写“无特殊背景”。）*

      ## 2. 难字与地名解析 (Lexicon & Geography)
      *请列出本章中可能让弟兄姊妹感到陌生或困惑的 2-3 个名词/地名/人名，并给出简明解释。*
      * *[词汇1]：解释...*
      * *[词汇2]：解释...*

      ## 3. 平行经文与串珠 (Cross References)
      *请列出 3 处与本章有紧密联系的其他经文（旧约预言、新约引用或符类福音平行文），并说明为什么关联。*
      * *关联 1：...*
      * *关联 2：...*

      ## 4. 助读思考题 (Reflective Questions)
      *请不要给出答案。请提供 3 个引导性的问题，帮助主领人在阅读时把心安静下来，自己去捕捉亮光。*
      * *问题 1：(关注经文细节)*
      * *问题 2：(关注人物反应或神的属性)*
      * *问题 3：(关注应用)*

      请保持客观、准确、学术性但易懂。
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });

    return response.text || "无法生成内容，请重试。";
  } catch (error) {
    handleGeminiError(error);
    return ""; // Should not reach here
  }
};

/**
 * Generates the Meeting Summary from Audio
 */
export const generateMeetingSummary = async (audioFile: File): Promise<string> => {
  try {
    if (!API_KEY || API_KEY === "DUMMY_KEY_TO_PREVENT_CRASH_ON_INIT") throw new Error("API key must be a string");

    const audioPart = await fileToGenerativePart(audioFile);
    const currentDate = new Date().toLocaleDateString('zh-CN');
    
    const prompt = `
      你是一位专业的团契记录员和神学编辑。请听这段Zoom查经录音，生成一份《周二查经汇》归档文档。
      
      **录音时间结构分析 (关键)**：
      1. **前半场 (0-40分钟)**：主领人（弟兄/姊妹）分享。这是基础铺垫。
      2. **后半场 (40分钟-结束)**：资深牧者带领。**这是核心部分，占比约 1.5 小时。** 牧者会重新带领大家查考这一章，进行深度神学梳理和问答。

      **任务目标：**
      请忽略无意义的寒暄和技术噪音，重点提取牧者在后半场的深度教导。
      
      请严格按照以下 Markdown 模版输出（不要改变标题层级）：

      # 📘 周二查经汇：[经文书卷 - 第X章] (请根据录音推断填入)

      ---

      ## 📖 I. 查经概览
      * **经文：** [根据录音推断]
      * **查经日期：** ${currentDate} (或根据录音提及日期修改)
      * **主领人：** [根据录音推断，若不知道写"待定"]

      ## 🗣️ II. 主领人分享总结
      > [请精炼总结前 30-40 分钟主领人的分享摘要，约 100-150 字]

      ## 💡 III. 牧者核心解经要点 (🌟 重点归档：权重 70% 成果)
      *请详细梳理牧者在后半段的教导，提取 3-5 个最重要的神学观点、解经结论或实际应用。*
      * **[要点 1 标题]**：[详细内容...]
      * **[要点 2 标题]**：[详细内容...]
      * **[要点 3 标题]**：[详细内容...]

      ## 🌟 IV. 本章金句与核心真理
      * **本章金句：** "[请根据上下文提取 1-2 句核心经文]"
      * **核心主题：** [用一句话总结本章最重要的属灵中心思想]

      ## ❓ V. 组员疑问焦点
      *请捕捉后半段互动环节的问题。*
      * **疑问：** [组员提出的问题] -> **回应精要：** [牧者的简短解答]

      **要求：**
      * 语气庄重、温暖、神学准确。
      * 重点突出牧者的深度教导。
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_MULTIMODAL,
      contents: {
        parts: [audioPart, { text: prompt }]
      },
    });

    return response.text || "无法分析录音，请重试。";
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};

/**
 * Generates Deep Theological Insights for the Pastor
 */
export const generatePastorInsights = async (book: string, chapter: string, focus: string): Promise<string> => {
  try {
    if (!API_KEY || API_KEY === "DUMMY_KEY_TO_PREVENT_CRASH_ON_INIT") throw new Error("API key must be a string");

    const prompt = `
      你是一位博士级神学研究助理（Research Assistant），正在协助一位服侍30年的资深牧者。
      
      **用户背景**：牧者对圣经非常熟悉，不需要基础的经文概览。
      **核心需求**：他需要顶级的学术素材，用于支持他在聚会后半段（1.5小时）的深度讲论。

      针对《${book}》第 ${chapter} 章，${focus ? `请特别围绕以下方向进行研究："${focus}"。` : "请提供通用的深度研究资料。"}

      # 🏛️ 牧者研经室：深度素材 (${book} ${chapter})

      ## 📜 1. 原文考古与语文学 (Philology)
      *请挑选本章中 1-2 个最具神学张力或容易被误读的希腊文/希伯来文单词。*
      * 展示其原文字根、原文时态（Tense/Voice/Mood）的特殊意义。
      * 解释它在原文语境下比中文翻译更丰富的含义。

      ## 🕸️ 2. 救赎历史与互文性 (Redemptive History)
      *不要只看这一章。请将这一章的内容置于整本圣经的宏大叙事中。*
      * 它如何回响了旧约的圣约（Covenant）？
      * 它如何指向基督的完成（Christological Fulfillment）？

      ## 🗣️ 3. 释经历史与争论 (History of Interpretation)
      *历史上教会对此处是否有不同的解读？*
      * 简述一两个经典观点（例如：奥古斯丁、路德、加尔文或现代福音派学者的不同看见）。
      * *（无需给出定论，旨在为牧者提供讨论素材）*

      ## ⚔️ 4. 当代神学挑战 (Apologetics & Application)
      *如果在当晚的问答环节，有信徒提出关于本章的高难度神学质疑（例如关于神的公义、预定、伦理矛盾），请提供一个基于系统神学的回应思路。*

      请使用学术且严谨的语言，支持牧者进行厚重的神学输出。
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: PASTOR_MODEL,
      contents: prompt,
      config: {
        // Use Thinking Config to enhance depth even on Flash model
        // thinkingConfig: { thinkingBudget: 1024 }, // Optional: Enable if needed and available on Flash
      }
    });

    return response.text || "无法生成深度内容。";
  } catch (error) {
    handleGeminiError(error);
    return "";
  }
};

/**
 * 智能探测神学议题 (Topic Suggestions)
 */
export interface SuggestedTopic {
  title: string;
  query: string;
}

export const generateTheologicalTopics = async (book: string, chapter: string): Promise<SuggestedTopic[]> => {
  try {
    if (!API_KEY || API_KEY === "DUMMY_KEY_TO_PREVENT_CRASH_ON_INIT") throw new Error("API key must be a string");

    const prompt = `
      分析《${book}》第 ${chapter} 章。
      
      请找出 3-4 个该章节中最重要的神学议题、历史上著名的释经争议或核心教义难点。
      目标是供一位资深牧者选择，以便进行深度研经。

      请返回一个纯 JSON 格式，结构如下：
      {
        "topics": [
          {
            "title": "简短的标签名 (例如 '预定论的张力')",
            "query": "当用户点击标签时，填入文本框的完整指令 (例如 '请重点分析本章中关于预定论的经文，并对比加尔文与阿米念的解释...')"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) return [];

    // Robust parsing: Remove markdown code blocks if present (e.g., ```json ... ```)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanedText);
      // Support both { topics: [...] } (requested) and raw [...] (fallback)
      if (Array.isArray(parsed)) {
          return parsed as SuggestedTopic[];
      } else if (parsed.topics && Array.isArray(parsed.topics)) {
          return parsed.topics as SuggestedTopic[];
      }
      return [];
    } catch (parseError) {
      console.error("JSON Parse failed", text);
      return [];
    }

  } catch (error) {
    // IMPORTANT: Don't swallow errors silently. Throw it so the UI knows.
    console.error("Topic generation failed:", error);
    handleGeminiError(error); 
    return [];
  }
};
