import { NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'tasks.json')
const EXPORT_DIR = path.join(process.cwd(), 'tasks-md')

// Export tasks as markdown files (lifeos blueprint format)
export async function POST() {
  if (!existsSync(TASKS_FILE)) {
    return NextResponse.json({ error: 'No tasks' }, { status: 404 })
  }

  const tasks = JSON.parse(await readFile(TASKS_FILE, 'utf-8'))

  if (!existsSync(EXPORT_DIR)) {
    await mkdir(EXPORT_DIR, { recursive: true })
  }

  const exported: string[] = []

  for (const task of tasks) {
    const date = task.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
    const slug = task.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40)
    const fileName = `${date}-${slug}.md`

    const md = `# Task: ${task.title}
date: ${date}
status: ${task.status}
project: kanban-dump
${task.fileName ? `file: ${task.fileName}` : ''}

## Description
${task.transcription || task.description || 'Task from dropped file.'}
${task.filePath ? `\n## References\n- [${task.fileName}](${task.filePath})` : ''}
`

    await writeFile(path.join(EXPORT_DIR, fileName), md)
    exported.push(fileName)
  }

  return NextResponse.json({ exported, dir: EXPORT_DIR })
}
