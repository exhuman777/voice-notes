'use client'

import { Task } from '@/lib/store'
import { getFileType } from '@/lib/utils'

interface FilePreviewProps {
  task: Task
}

export function FilePreview({ task }: FilePreviewProps) {
  if (!task.filePath || !task.fileName) {
    return (
      <div className="flex items-center justify-center h-full bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
        <span className="text-zinc-400">No file attached</span>
      </div>
    )
  }

  const fileType = getFileType(task.fileName)

  return (
    <div className="h-full overflow-auto bg-zinc-50 dark:bg-zinc-900 rounded-lg">
      {fileType === 'image' && (
        <img
          src={task.filePath}
          alt={task.fileName}
          className="max-w-full h-auto object-contain"
        />
      )}

      {fileType === 'audio' && (
        <div className="p-4 space-y-4">
          <audio controls className="w-full">
            <source src={task.filePath} />
          </audio>
          {task.transcription && (
            <div className="p-3 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-500 mb-1">Transcription:</p>
              <p className="text-sm">{task.transcription}</p>
            </div>
          )}
        </div>
      )}

      {fileType === 'video' && (
        <video controls className="max-w-full h-auto">
          <source src={task.filePath} />
        </video>
      )}

      {fileType === 'pdf' && (
        <iframe
          src={task.filePath}
          className="w-full h-full min-h-[400px]"
          title={task.fileName}
        />
      )}

      {(fileType === 'text' || fileType === 'code') && (
        <TextPreview filePath={task.filePath} />
      )}

      {fileType === 'other' && (
        <div className="p-4 text-center">
          <p className="text-zinc-500 mb-2">{task.fileName}</p>
          <a
            href={task.filePath}
            download
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Download File
          </a>
        </div>
      )}
    </div>
  )
}

function TextPreview({ filePath }: { filePath: string }) {
  return (
    <iframe
      src={filePath}
      className="w-full h-full min-h-[300px] bg-white dark:bg-zinc-900"
      title="Text preview"
    />
  )
}
