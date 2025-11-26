import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SafetyGrade, RuleType } from "../types";
import { RULES } from "../constants";

// Construct the system prompt dynamically from our constants to ensure consistency
const SYSTEM_INSTRUCTION = `
You are an expert Content Safety Moderator for an e-commerce platform (电商平台内容审核专家).
Your task is to evaluate a product based on its **Image** and **Description** against specific safety rules (R1-R5).

**IMPORTANT:**
1. You must use BOTH the product image and the product description to check against ALL rules (R1, R2, R3, R4, R5). Do not limit specific inputs to specific rules.
2. All reasoning, summaries, and logic explanations in the JSON output MUST be in **Simplified Chinese (简体中文)**.

**Rules Definition:**
${RULES.map(r => `
- ${r.id} (${r.name}):
  - Criteria: ${r.criteria.join('; ')}
  - Examples: ${r.examples.join('; ')}
`).join('')}

**Grading Logic:**
- **S0**: No R1-R5 issues found (无任何R1-R5问题).
  - Intervention: Normal recommendation (正常推荐).
- **S1**: Meets exactly 1 rule from R1-R5, and it is NOT a severe risk.
  - Intervention: Restricted visibility (限流).
- **S2**: Meets 3 or more rules, OR contains a single EXTREMELY SEVERE violation (or meets 2 severe rules).
  - Intervention: Filtered/Blocked (过滤/拦截).

**Output Format:**
Return the result strictly in JSON format matching the schema.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    grade: {
      type: Type.STRING,
      enum: [SafetyGrade.S0, SafetyGrade.S1, SafetyGrade.S2],
      description: "The final safety grade S0, S1, or S2."
    },
    intervention: {
      type: Type.STRING,
      description: "The intervention strategy based on the grade (in Chinese)."
    },
    coreLogic: {
      type: Type.STRING,
      description: "Short explanation of the core logic for this decision (e.g., '命中1条规则，轻微风险'). In Chinese."
    },
    summary: {
      type: Type.STRING,
      description: "A brief summary of the findings (in Chinese)."
    },
    violations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ruleId: {
            type: Type.STRING,
            enum: [RuleType.R1, RuleType.R2, RuleType.R3, RuleType.R4, RuleType.R5],
          },
          detected: {
            type: Type.BOOLEAN,
          },
          reasoning: {
            type: Type.STRING,
            description: "Why this rule was triggered or not triggered (in Chinese)."
          }
        },
        required: ["ruleId", "detected", "reasoning"]
      }
    }
  },
  required: ["grade", "intervention", "coreLogic", "violations", "summary"]
};

export const analyzeProductContent = async (
  description: string, 
  imageBase64: string | null,
  imageMimeType: string | null
): Promise<AnalysisResult> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];
  
  if (description) {
    parts.push({ text: `Product Description: ${description}` });
  }

  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType
      }
    });
  } else {
    // Fallback if no image
    parts.push({ text: "[No image provided, analyze text only]" });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for consistent rule application
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(textResponse) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};