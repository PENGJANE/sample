import { RuleType, RuleDefinition, SafetyGrade } from './types';

export const RULES: RuleDefinition[] = [
  {
    id: RuleType.R1,
    name: "生理不适/低俗",
    criteria: [
      "商品图含有逼真的血腥、体液等非常规元素",
      "主图包含人体器官特写（脚掌、舌头等）"
    ],
    examples: ["肥牛袜子 (模拟生肉)", "大脚丫捏捏乐 (器官特写)", "搞怪手机壳 (器官特写)"]
  },
  {
    id: RuleType.R2,
    name: "人身攻击/歧视",
    criteria: [
      "商品图或文字暗示特定人群为贬义对象",
      "涉及种族、地域、身体特征、职业的负面刻板印象"
    ],
    examples: ["猪脸T恤 (将人脸替换为猪脸)", "非洲小孩 (种族刻板印象)"]
  },
  {
    id: RuleType.R3,
    name: "负面/危险联想",
    criteria: [
      "商品形态或使用场景类似危险物品或行为",
      "可能引发对自残、暴力、疾病、不体面场景的联想"
    ],
    examples: ["粗麻绳围巾 (视觉形态像上吊绳)", "精神病院病号服 (关联疾病)"]
  },
  {
    id: RuleType.R4,
    name: "过度猎奇/恶搞",
    criteria: [
      "主图使用非商品实物图（如表情包、PS拼贴、扭曲特效）",
      "图片出现明显的空间扭曲、五官错位等非正常视觉效果"
    ],
    examples: ["发声萝卜挂件 (商品图明显扭曲)"]
  },
  {
    id: RuleType.R5,
    name: "价值观导向不良",
    criteria: [
      "标题或内容与公序良俗明显冲突",
      "宣传投机取巧、不劳而获"
    ],
    examples: ["如何让富婆爱上你 (价值观导向不良)"]
  }
];

export const GRADE_DEFINITIONS = {
  [SafetyGrade.S0]: {
    label: "S0 - 无风险",
    intervention: "正常推荐",
    logic: "放心推",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  [SafetyGrade.S1]: {
    label: "S1 - 轻微风险",
    intervention: "限流：首页/热门不推，搜索降权",
    logic: "不主动推，但允许用户主动找",
    color: "bg-orange-100 text-orange-800 border-orange-200"
  },
  [SafetyGrade.S2]: {
    label: "S2 - 严重风险",
    intervention: "过滤：推荐流拦截，搜索降权+提示",
    logic: "主动保护用户，避免舆情风险",
    color: "bg-red-100 text-red-800 border-red-200"
  }
};