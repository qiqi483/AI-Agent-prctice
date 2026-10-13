import type { InspectorFinding, InspectorReport, Project } from './types'

export interface InspectorFile {
  name: string
  content: string
}

const TEXT_FILE =
  /\.(md|markdown|txt|js|jsx|ts|tsx|mjs|cjs|py|rs|go|java|c|cpp|h|hpp|cs|rb|php|swift|kt|vue|svelte|json|yaml|yml|toml|lock|html|css|scss|less|sh|ps1|ipynb|sql|env|config)$/i

const NO_EXTENSION_TEXT = /^(dockerfile|makefile|license|procfile|\.gitignore|\.env\b)/i

const MAX_FILE_SIZE = 800_000

export async function readFolderFiles(fileList: FileList | File[]): Promise<InspectorFile[]> {
  const source = Array.isArray(fileList) ? fileList : Array.from(fileList)
  const candidates = source.filter((file) => {
    const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name
    return (
      !/node_modules[/\\]/.test(relative) &&
      file.size <= MAX_FILE_SIZE &&
      (TEXT_FILE.test(file.name) || NO_EXTENSION_TEXT.test(file.name))
    )
  })

  const results = await Promise.all(
    candidates.map(async (file) => {
      try {
        const content = await file.text()
        return { name: file.name, content }
      } catch {
        return null
      }
    }),
  )

  return results.filter((item): item is InspectorFile => item !== null && item.content.trim().length > 0)
}

function hasFile(files: InspectorFile[], pattern: RegExp): boolean {
  return files.some((file) => pattern.test(file.name))
}

function textOf(files: InspectorFile[]): string {
  return files.map((file) => `${file.name}\n${file.content}`).join('\n')
}

function pushFinding(
  findings: InspectorFinding[],
  dimension: string,
  condition: boolean | number,
  threshold: number,
  text: string,
): number {
  const hit = typeof condition === 'number' ? condition >= threshold : condition
  const level = hit ? 'good' : 'miss'
  findings.push({ dimension, level, text })
  return hit ? 1 : 0
}

function scoreCompletion(files: InspectorFile[], findings: InspectorFinding[]): number {
  const hasManifest = hasFile(files, /(package\.json|requirements\.txt|pyproject\.toml|cargo\.toml|go\.mod|gemfile|composer\.json)$/i)
  const hasReadme = hasFile(files, /readme\.(md|markdown|txt)$/i)
  const codeFiles = files.filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs|py|rs|go|java|c|cpp|cs|rb|php|swift|kt|vue|svelte)$/i.test(file.name)).length
  const hasTests = hasFile(files, /(test|spec|__tests__)/i)
  const hasEntry = hasFile(files, /(index|main|app)\.(ts|tsx|js|jsx|py|rs|go)$/i) || hasManifest

  let score = 0
  score += pushFinding(findings, '完成度', hasManifest, 1, '包含依赖清单或项目配置文件') * 25
  score += pushFinding(findings, '完成度', hasReadme, 1, '包含 README 或说明文档') * 15
  score += pushFinding(findings, '完成度', codeFiles, 6, `源码文件充足（当前 ${codeFiles} 个）`) * 30
  if (!hasReadme && !hasManifest) {
    findings.push({ dimension: '完成度', level: 'miss', text: '缺少依赖清单与说明文档' })
  }
  score += pushFinding(findings, '完成度', hasTests, 1, '包含测试或示例') * 15
  score += pushFinding(findings, '完成度', hasEntry, 1, '能找到可运行入口') * 15
  return score
}

function scoreInnovation(files: InspectorFile[], findings: InspectorFinding[]): number {
  const hasNotes = hasFile(files, /(notes?|experiments?|ideas?|docs?)/i)
  const hasScripts = hasFile(files, /(scripts?[/\\])|(\.(sh|ps1)$)/i)
  const customMarks = (textOf(files).match(/TODO|FIXME|自定义|改进|实验/g) ?? []).length
  const extraFiles = files.filter((file) => !/(package\.json|requirements\.txt|pyproject\.toml|readme|lock)$/i.test(file.name)).length

  let score = 0
  score += pushFinding(findings, '创新度', hasNotes, 1, '有独立的笔记、实验或文档目录') * 30
  score += pushFinding(findings, '创新度', hasScripts, 1, '有自己的脚本或自动化入口') * 25
  score += pushFinding(findings, '创新度', customMarks, 3, `有自定义标记或改进记录（${customMarks} 处）`) * 20
  score += pushFinding(findings, '创新度', extraFiles, 8, `在脚手架之外扩展了 ${extraFiles} 个文件`) * 25
  return score
}

function scoreSimilarity(files: InspectorFile[], project: Project, findings: InspectorFinding[]): number {
  const corpus = textOf(files).toLowerCase()
  const projectHits = [project.name, project.repo.split('/').pop() ?? '', ...project.tech].filter(
    (token) => token && corpus.includes(token.toLowerCase()),
  ).length
  const conceptHits = project.learnPoints.filter((point) => corpus.includes(point.toLowerCase())).length
  const structureHits = ['src', 'app', 'core', 'agent', 'tool', 'component', 'ui'].filter((word) =>
    corpus.includes(word),
  ).length

  let score = 0
  score += pushFinding(findings, '相似度', projectHits, 2, `命中 ${projectHits} 个与原项目相关的名称或技术关键词`) * 35
  score += pushFinding(findings, '相似度', conceptHits, 2, `命中 ${conceptHits} 个学习点概念`) * 40
  score += pushFinding(findings, '相似度', structureHits, 4, `目录结构接近原项目（${structureHits}/7）`) * 25
  return score
}

function scoreAesthetics(files: InspectorFile[], findings: InspectorFinding[]): number {
  const hasStyles = hasFile(files, /\.(css|scss|less|sass)$/i) || /tailwind/.test(textOf(files))
  const hasComponents = hasFile(files, /(components?|pages?|ui)[/\\]/i)
  const readme = files.find((file) => /readme\.(md|markdown|txt)$/i.test(file.name))
  const readmeRich = (readme?.content.length ?? 0) >= 400
  const hasAssets = hasFile(files, /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf)$/i) || hasFile(files, /(assets?|public|static)[/\\]/i)

  let score = 0
  score += pushFinding(findings, '美观度', hasStyles, 1, '包含样式或主题配置') * 30
  score += pushFinding(findings, '美观度', hasComponents, 1, '有组件或页面目录') * 25
  score += pushFinding(findings, '美观度', readmeRich, 1, 'README 结构清晰、内容充实') * 25
  score += pushFinding(findings, '美观度', hasAssets, 1, '包含图标、图片或静态资源') * 20
  return score
}

function summarize(total: number): string {
  if (total >= 85) return '完成度很高，核心闭环、文档与成品观感都到位，可以打卡了。'
  if (total >= 70) return '主体已完成，补一补薄弱项后即可打卡。'
  if (total >= 50) return '已经具备雏形，建议对照验收标准继续完善。'
  return '还处于早期阶段，先把能跑通的最小闭环做出来。'
}

export function inspectProject(project: Project, files: InspectorFile[]): InspectorReport {
  const findings: InspectorFinding[] = []
  const dimensions = {
    completion: scoreCompletion(files, findings),
    innovation: scoreInnovation(files, findings),
    similarity: scoreSimilarity(files, project, findings),
    aesthetics: scoreAesthetics(files, findings),
  }

  const total = Math.round(
    dimensions.completion * 0.4 +
      dimensions.innovation * 0.2 +
      dimensions.similarity * 0.2 +
      dimensions.aesthetics * 0.2,
  )

  return {
    projectId: project.id,
    checkedAt: new Date().toISOString(),
    fileCount: files.length,
    total,
    dimensions,
    findings,
    summary: summarize(total),
  }
}
