import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the Gemini Client
// 💡 架构提示 (Architecture Note):
// 如果未来要迁移到国内模型 (如 DeepSeek):
// 1. 文本生成部分 (generatePrepOutline, generatePastorInsights) 可以轻松替换为 OpenAI 兼容接口。
// 2. 录音部分 (generateMeetingSummary) Gemini 具有原生多模态优势。
//    若换国内模型，需先调用 ASR (如阿里通义听悟) 转文字，再传给 LLM 总结。
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY,
  baseUrl: process.env.API_BASE_URL // 支持反向代理，解决国内访问 Google API 的网络问题
});

// Models
const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_MULTIMODAL = 'gemini-2.5-flash'; 
// 牧者助手使用 Pro 模型，并开启 Thinking (思考) 模式，对标 DeepSeek R1 的推理深度
const PASTOR_MODEL = 'gemini-3-pro-preview'; 

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
 * Generates the Leader Preparation Context (Information only, no spiritual conclusions)
 */
export const generatePrepOutline = async (book: string, chapter: string): Promise<string> => {
  try {
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
    console.error("Gemini Prep Error:", error);
    throw error;
  }
};

/**
 * Generates the Meeting Summary from Audio
 */
export const generateMeetingSummary = async (audioFile: File): Promise<string> => {
  try {
    const audioPart = await fileToGenerativePart(audioFile);
    
    const prompt = `
      你是一位专业的团契记录员和神学编辑。请听这段Zoom查经录音（约2小时），生成一份《周二查经汇·精华回顾》。
      
      **录音时间结构分析 (关键)**：
      1. **前半场 (0-40分钟)**：主领人（弟兄/姊妹）分享。这是基础铺垫。
      2. **后半场 (40分钟-结束)**：资深牧者带领。**这是核心部分，占比约 1.5 小时。** 牧者会重新带领大家查考这一章，进行深度神学梳理和问答。

      **任务目标：**
      请忽略无意义的寒暄和技术噪音，重点提取牧者在后半场的深度教导。

      请严格按照以下 Markdown 格式输出：

      # 📖 查经精华回顾

      ## 🗣️ 引言：主领人分享
      *简要概括主领人的核心感动和切入点 (约100字)。*

      ## 🦅 核心：牧者深度查考 (重点)
      *这是回顾的精华部分。请详细记录牧者在后半段重新查考本章时指出的关键神学点。*
      * *观点 1：...*
      * *观点 2：...*
      * *观点 3：...*

      ## ❓ 现场讨论与答疑
      *记录大家提出的疑难问题，以及牧者基于圣经给出的解答。*

      ## 💡 神学总结与应用
      *牧者最后是如何总结这一章的神学意义的？对我们的生活有什么具体的应用呼召？*

      语言风格：温暖、庄重、条理清晰。
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_MULTIMODAL,
      contents: {
        parts: [audioPart, { text: prompt }]
      },
    });

    return response.text || "无法分析录音，请重试。";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    throw error;
  }
};

/**
 * Generates Deep Theological Insights for the Pastor
 */
export const generatePastorInsights = async (book: string, chapter: string, focus: string): Promise<string> => {
  try {
    const prompt = `
      你是一位博士级神学研究助理（Research Assistant），正在协助一位服侍30年的资深牧者。
      
      **用户背景**：牧者对圣经非常熟悉，不需要基础的经文概览。
      **核心需求**：他需要顶级的学术素材，用于支持他在聚会后半段（1.5小时）的深度讲论。

      针对《${book}》第 ${chapter} 章，${focus ? `特别关注：${focus}，` : ""}请提供以下深度研究资料：

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
        thinkingConfig: { thinkingBudget: 10000 } // High budget for deep reasoning
      }
    });

    return response.text || "无法生成深度内容。";
  } catch (error) {
    console.error("Gemini Pastor Error:", error);
    throw error;
  }
};