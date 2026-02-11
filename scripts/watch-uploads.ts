#!/usr/bin/env npx tsx
import { watch } from 'chokidar'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const TASKS_FILE = path.join(process.cwd(), 'tasks.json')
const PROCESSED_FILE = path.join(process.cwd(), '.processed-files.json')

async function getProcessedFiles(): Promise<Set<string>> {
  if (!existsSync(PROCESSED_FILE)) return new Set()
  const data = await readFile(PROCESSED_FILE, 'utf-8')
  return new Set(JSON.parse(data))
}

async function markProcessed(fileName: string) {
  const processed = await getProcessedFiles()
  processed.add(fileName)
  await writeFile(PROCESSED_FILE, JSON.stringify([...processed], null, 2))
}

async function getTasks(): Promise<unknown[]> {
  if (!existsSync(TASKS_FILE)) return []
  const data = await readFile(TASKS_FILE, 'utf-8')
  return JSON.parse(data)
}

async function addTask(fileName: string, filePath: string) {
  const tasks = await getTasks()

  const task = {
    id: uuid(),
    title: fileName,
    status: 'todo',
    filePath: `/api/files/${path.basename(filePath)}`,
    fileName,
    fileType: getFileType(fileName),
    createdAt: new Date().toISOString(),
  }

  tasks.push(task)
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
  console.log(`✓ Added task: ${fileName}`)
}

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'flac']
  if (imageExts.includes(ext)) return 'image'
  if (audioExts.includes(ext)) return 'audio'
  if (ext === 'pdf') return 'pdf'
  return 'other'
}

console.log(`👀 Watching ${UPLOADS_DIR} for new files...`)

const watcher = watch(UPLOADS_DIR, {
  ignoreInitial: false,
  persistent: true,
})

watcher.on('add', async (filePath) => {
  const fileName = path.basename(filePath)

  // Skip hidden files and already processed
  if (fileName.startsWith('.')) return

  const processed = await getProcessedFiles()
  if (processed.has(fileName)) return

  await addTask(fileName, filePath)
  await markProcessed(fileName)
})

watcher.on('error', (error) => console.error('Watcher error:', error))

process.on('SIGINT', () => {
  console.log('\n👋 Stopping watcher...')
  watcher.close()
  process.exit(0)
})
