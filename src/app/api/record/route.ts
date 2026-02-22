import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
// Configure these paths for your system (see README)
const FFMPEG_PATH = process.env.FFMPEG_PATH || '/opt/homebrew/bin/ffmpeg'
const WHISPER_PATH = process.env.WHISPER_PATH || '/opt/homebrew/bin/whisper-cli'
const MODEL_PATH = process.env.WHISPER_MODEL || path.join(os.homedir(), '.whisper-models/ggml-base.bin')

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as Blob
  const lang = (formData.get('language') as string) || 'auto'

  if (!audio) {
    return NextResponse.json({ error: 'No audio' }, { status: 400 })
  }

  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true })
  }

  const timestamp = Date.now()
  const webmPath = path.join(UPLOADS_DIR, `${timestamp}-recording.webm`)
  const wavPath = path.join(UPLOADS_DIR, `${timestamp}-recording.wav`)
  const savedAs = `${timestamp}-recording.wav`

  // Save webm
  const buffer = Buffer.from(await audio.arrayBuffer())
  await writeFile(webmPath, buffer)

  // Convert to wav
  try {
    await execAsync(`"${FFMPEG_PATH}" -y -i "${webmPath}" -ar 16000 -ac 1 "${wavPath}"`, { timeout: 30000 })
  } catch (err) {
    console.error('FFmpeg error:', err)
    return NextResponse.json({ error: 'Audio conversion failed' }, { status: 500 })
  }

  // Transcribe
  let transcription = ''
  try {
    await execAsync(
      `"${WHISPER_PATH}" -m "${MODEL_PATH}" -l ${lang} -f "${wavPath}" -otxt -of "${wavPath.replace('.wav', '')}"`,
      { timeout: 180000 }
    )
    const { stdout } = await execAsync(`cat "${wavPath.replace('.wav', '.txt')}"`)
    transcription = stdout.trim()
  } catch (err) {
    console.error('Whisper error:', err)
    transcription = '[Transcription failed]'
  }

  return NextResponse.json({
    filePath: `/api/files/${savedAs}`,
    fileName: `recording-${timestamp}.wav`,
    savedAs,
    transcription,
  })
}
