/** 萌智伴学本地答疑（无后端时的规则回复） */
import { buildConstitutionAiReply, type ConstitutionResult } from '@/utils/constitutionEvaluate'

const CONSTITUTION_PAYLOAD_KEY = 'bencao_constitution_payload'

export function tryConstitutionReply(question: string): string | null {
  const q = question.trim()
  if (!/九体质|体质测评|体质自测|体质解读/.test(q)) return null
  try {
    const raw = sessionStorage.getItem(CONSTITUTION_PAYLOAD_KEY)
    if (!raw) return null
    const { answers, result } = JSON.parse(raw) as {
      answers: Record<number, number>
      result: ConstitutionResult
    }
    sessionStorage.removeItem(CONSTITUTION_PAYLOAD_KEY)
    return `${buildConstitutionAiReply(answers, result)}

如需针对饮食、运动或兼夹体质进一步细化，欢迎继续提问。`
  } catch {
    return null
  }
}

export function buildStudyReply(question: string): string {
  const q = question.trim()

  if (/黄芪|党参|人参/.test(q)) {
    return `**补气类药材简析**

- **黄芪**：甘、微温，归脾肺经，长于补气升阳、固表止汗，常用于气虚乏力、自汗。
- 学习时可对比党参（补中益气）、人参（大补元气），注意实热、气滞慎用。

如需记忆口诀，可记：「黄芪固表汗，党参健脾气」。你还想对比哪味药？`
  }

  if (/四气五味|五味|四气/.test(q)) {
    return `**四气五味**是中药性能概括的核心：

- **四气**：寒、热、温、凉（平性可附于温凉理解）
- **五味**：辛、甘、酸、苦、咸

复习建议：先记「辛散、苦降、酸收、咸软、甘补」，再结合具体药材（如黄连苦、甘草甘）做卡片背诵。`
  }

  if (/当归|白芍|区别|区分/.test(q)) {
    return `**当归 vs 白芍**（常考对比）

| | 当归 | 白芍 |
|---|---|---|
| 性味 | 甘辛温 | 苦酸微寒 |
| 归经 | 肝心脾 | 肝脾 |
| 功效 | 补血活血、调经止痛 | 养血敛阴、柔肝止痛 |

一句话：当归偏「补活血」，白芍偏「养血敛阴」。`
  }

  if (/计划|备考|复习|怎么学/.test(q)) {
    return `**中药学备考小计划（7 天示例）**

1. **第 1–2 天**：四气五味、升降浮沉、归经 + 50 味常用药性
2. **第 3–4 天**：解表、清热、补气类方剂与代表药
3. **第 5 天**：配伍禁忌（十八反十九畏）+ 毒性药要点
4. **第 6–7 天**：刷真题 + 错题本回顾

每天 25 分钟「图鉴速记」+ 10 分钟自测效果最好。需要我按你的基础定制吗？`
  }

  if (/体质|九体质/.test(q)) {
    return `你可以在本站 **首页 → 九体质自测**（或点击右下角小萌机器人）完成 20 题标准问卷，系统会自动判定九体质倾向并给出调养建议。

完成后也可点击「AI 深入解读」，我会结合你的答题明细进一步分析。`
  }

  if (/图鉴|本草图鉴|药材/.test(q)) {
    return `在本草萌智里，你可以：

1. 打开 **本草图鉴** 按性味、归经筛选药材
2. 用 **萌智伴学** 提问不懂的药名、功效对比
3. 到 **药膳食疗** 看药食同源应用

告诉我一味你想学的药，我可以帮你整理「性味归经 + 主治 + 记忆点」。`
  }

  return `你好，我是 **萌智伴学** 小助手 🌿

我可以帮你：
- 解释药材性味、功效与对比
- 梳理四气五味、方剂入门
- 制定本草复习计划

请直接输入你的问题，或点击下方推荐话题开始对话。`
}
