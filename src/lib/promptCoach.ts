import type { Project } from './types'

export function generatePracticePrompt(project: Project): string {
  return [
    `# 练习任务：${project.name}`,
    `你是我的 Agent 练习搭档。我要复刻 ${project.name}，请按下面的要求一步步引导我完成，每完成一步都停下来等我确认。`,
    '',
    '## 目标',
    project.summary,
    '',
    '## 技术栈',
    project.tech.join('、'),
    '',
    '## 学习重点',
    ...project.learnPoints.map((point) => `- ${point}`),
    '',
    '## 建议步骤',
    ...project.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    '## 验收标准',
    ...project.acceptance.map((item) => `- ${item}`),
    '',
    '## 输出要求',
    '- 每一步给出可执行命令或代码骨架',
    '- 解释关键模块的职责',
    '- 遇到卡点先给排查思路，再给答案',
  ].join('\n')
}

interface ScoreResult {
  score: number
  feedback: string[]
}

export function scorePrompt(project: Project, prompt: string): ScoreResult {
  const feedback: string[] = []
  let score = 0

  if (prompt.trim().length >= 120) {
    score += 20
  } else {
    feedback.push('提示词偏短，建议补充目标、步骤与验收标准')
  }

  if (/目标|背景|复刻/.test(prompt)) {
    score += 15
  } else {
    feedback.push('缺少明确的练习目标')
  }

  if (project.tech.some((tech) => prompt.includes(tech))) {
    score += 15
  } else {
    feedback.push(`建议写明技术栈：${project.tech.join('、')}`)
  }

  if (/步骤|流程|先.*再/.test(prompt)) {
    score += 15
  } else {
    feedback.push('缺少分步骤的执行计划')
  }

  if (/验收|标准|跑通|讲清楚|扩展/.test(prompt)) {
    score += 15
  } else {
    feedback.push('缺少验收标准或完成定义')
  }

  if (/输出|格式|命令|代码/.test(prompt)) {
    score += 10
  } else {
    feedback.push('可以补充输出格式要求')
  }

  if (/卡点|错误|排查|纠错/.test(prompt)) {
    score += 10
  } else {
    feedback.push('可以补充遇到卡点时的处理方式')
  }

  return { score, feedback }
}

export function revisePrompt(project: Project, original: string): string {
  const blocks: string[] = [original.trim()]

  if (!/目标|背景/.test(original)) {
    blocks.push(`## 目标\n${project.summary}`)
  }
  if (!/技术栈/.test(original)) {
    blocks.push(`## 技术栈\n${project.tech.join('、')}`)
  }
  if (!/步骤/.test(original)) {
    blocks.push(`## 建议步骤\n${project.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`)
  }
  if (!/验收/.test(original)) {
    blocks.push(`## 验收标准\n${project.acceptance.map((item) => `- ${item}`).join('\n')}`)
  }
  if (!/输出|格式/.test(original)) {
    blocks.push('## 输出要求\n- 给出可执行步骤与代码骨架\n- 先给排查思路再给答案')
  }

  return blocks.join('\n\n')
}
