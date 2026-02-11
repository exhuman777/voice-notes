import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileType(fileName: string): 'image' | 'audio' | 'video' | 'text' | 'pdf' | 'code' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'webm']
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm']
  const textExts = ['txt', 'md', 'markdown', 'rtf']
  const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'json', 'yaml', 'yml', 'xml', 'sh', 'bash']

  if (imageExts.includes(ext)) return 'image'
  if (audioExts.includes(ext)) return 'audio'
  if (videoExts.includes(ext)) return 'video'
  if (ext === 'pdf') return 'pdf'
  if (textExts.includes(ext)) return 'text'
  if (codeExts.includes(ext)) return 'code'
  return 'other'
}

export function isAudioFile(fileName: string): boolean {
  return getFileType(fileName) === 'audio'
}
