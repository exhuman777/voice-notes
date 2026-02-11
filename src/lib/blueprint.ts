import { Task, TaskStatus } from './store'

// Blueprint format from lifeos/blueprints/project_task.blueprint.md
const STATUS_MAP: Record<TaskStatus, string> = {
  todo: 'todo',
  in_progress: 'in_progress',
  done: 'done',
}

export function taskToMarkdown(task: Task): string {
  const date = task.createdAt.split('T')[0]
  const status = STATUS_MAP[task.status]

  let md = `# Task: ${task.title}
date: ${date}
status: ${status}
project: kanban-dump
`

  if (task.fileName) {
    md += `file: ${task.fileName}\n`
  }

  md += `\n## Description\n`

  if (task.transcription) {
    md += `${task.transcription}\n`
  } else if (task.description) {
    md += `${task.description}\n`
  } else {
    md += `Task from dropped file.\n`
  }

  if (task.filePath) {
    md += `\n## References\n- [${task.fileName}](${task.filePath})\n`
  }

  return md
}

export function markdownToTask(md: string, id: string): Partial<Task> {
  const titleMatch = md.match(/^# Task: (.+)$/m)
  const dateMatch = md.match(/^date: (.+)$/m)
  const statusMatch = md.match(/^status: (.+)$/m)
  const fileMatch = md.match(/^file: (.+)$/m)

  const descSection = md.split('## Description')[1]?.split('##')[0]?.trim()

  const status = (statusMatch?.[1] || 'todo') as TaskStatus

  return {
    id,
    title: titleMatch?.[1] || 'Untitled',
    status,
    createdAt: dateMatch?.[1] ? new Date(dateMatch[1]).toISOString() : new Date().toISOString(),
    fileName: fileMatch?.[1],
    description: descSection,
  }
}
