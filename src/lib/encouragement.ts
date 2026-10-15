const OPENERS = ['做得不错，', '稳住节奏，', '别急着完美，', '今天也是练手的好日子，']

const BODIES = [
  '你选择开始，就已经超过了大多数停在收藏夹的人。',
  '每跑通一个最小闭环，都是在给未来的自己铺路。',
  '卡住不是失败，是你正在接近理解的边界。',
  '能讲清楚一个模块，比写完十份教程更值钱。',
  '把大目标拆小，今天的你只需要再进一步。',
]

const CLOSERS = [
  '继续把今天这一步走扎实。',
  '下一个项目已经在等你。',
  '记得给自己留一点复盘时间。',
]

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export function generateEncouragement(nickname?: string): string {
  const name = nickname?.trim()
  const opener = name ? `「${name}」，${pick(OPENERS)}` : pick(OPENERS)
  return `${opener}${pick(BODIES)}${pick(CLOSERS)}`
}
