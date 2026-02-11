'use client'

import { useState, useCallback } from 'react'
import { useTaskStore } from '@/lib/store'
import { isAudioFile, getFileType } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { addTask } = useTaskStore()

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const { filePath, savedAs, fileName } = await uploadRes.json()

      let transcription: string | undefined

      if (isAudioFile(file.name)) {
        try {
          const transcribeRes = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: savedAs }),
          })
          const data = await transcribeRes.json()
          transcription = data.transcription
        } catch {
          transcription = '[Audio file]'
        }
      }

      const task = addTask({
        title: file.name,
        description: transcription,
        status: 'todo',
        filePath,
        fileName,
        fileType: getFileType(file.name),
        transcription,
      })

      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
    } finally {
      setIsUploading(false)
    }
  }, [addTask])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach(handleFile)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400',
        isUploading && 'opacity-50 pointer-events-none'
      )}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          files.forEach(handleFile)
        }}
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <div className="text-3xl mb-2">📁</div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isUploading
            ? 'Uploading...'
            : isDragging
            ? 'Drop files here'
            : 'Drop files or click to add task'}
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          Audio files will be transcribed
        </p>
      </label>
    </div>
  )
}
