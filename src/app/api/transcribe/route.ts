import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, mkdtempSync, unlinkSync } from 'fs'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

// Configure these paths for your system (see README)
const WHISPER_PATH = process.env.WHISPER_PATH || '/opt/homebrew/bin/whisper-cli'
const FFMPEG_PATH = process.env.FFMPEG_PATH || '/opt/homebrew/bin/ffmpeg'
const MODEL_PATH = process.env.WHISPER_MODEL || path.join(os.homedir(), '.whisper-models/ggml-base.bin')

export async function POST(req: NextRequest) {
  const { fileName, language } = await req.json()
  const lang = language || 'auto'

  if (!fileName) {
    return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
  }

  const filePath = path.join(UPLOADS_DIR, fileName)

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Check whisper availability
  if (!existsSync(WHISPER_PATH) || !existsSync(MODEL_PATH)) {
    return NextResponse.json({
      transcription: '[Audio file - whisper-cli not configured]',
      error: 'Whisper not available',
    })
  }

  try {
    const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'kanban-'))
    const ext = path.extname(filePath).toLowerCase()
    let wavPath = filePath

    // Convert to WAV if needed (like lifeos Transcriber does)
    if (ext !== '.wav') {
      wavPath = path.join(tmpDir, `${path.basename(filePath, ext)}.wav`)
      await execAsync(
        `"${FFMPEG_PATH}" -y -i "${filePath}" -ar 16000 -ac 1 "${wavPath}"`,
        { timeout: 60000 }
      )
    }

    const { stdout } = await execAsync(
      `"${WHISPER_PATH}" -m "${MODEL_PATH}" -l ${lang} -f "${wavPath}" --no-timestamps`,
      { timeout: 300000 }
    )

    // Cleanup temp wav if created
    if (wavPath !== filePath && existsSync(wavPath)) {
      unlinkSync(wavPath)
    }

    const transcription = stdout.trim()
    return NextResponse.json({ transcription })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({
      transcription: '[Transcription failed]',
      error: String(error),
    })
  }
}
