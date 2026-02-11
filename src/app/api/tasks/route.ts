import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const TASKS_FILE = path.join(process.cwd(), 'tasks.json')

async function getTasks() {
  if (!existsSync(TASKS_FILE)) {
    return []
  }
  const data = await readFile(TASKS_FILE, 'utf-8')
  return JSON.parse(data)
}

async function saveTasks(tasks: unknown[]) {
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
}

export async function GET() {
  const tasks = await getTasks()
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const task = await req.json()
  const tasks = await getTasks()
  tasks.push(task)
  await saveTasks(tasks)
  return NextResponse.json(task)
}

export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const tasks = await getTasks()
  const idx = tasks.findIndex((t: { id: string }) => t.id === id)
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates }
    await saveTasks(tasks)
    return NextResponse.json(tasks[idx])
  }
  return NextResponse.json({ error: 'Task not found' }, { status: 404 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  let tasks = await getTasks()
  tasks = tasks.filter((t: { id: string }) => t.id !== id)
  await saveTasks(tasks)
  return NextResponse.json({ success: true })
}
