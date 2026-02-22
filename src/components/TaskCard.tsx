'use client'

import { useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, useTaskStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
}

export function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  const { deleteTask } = useTaskStore()
  const [copied, setCopied] = useState(false)
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const copyText = task.transcription || task.description || task.title

  const handleClick = (e: React.MouseEvent) => {
    // Don't interfere with delete button
    if ((e.target as HTMLElement).closest('button')) return

    if (clickTimer.current) {
      // Double click detected — open preview
      clearTimeout(clickTimer.current)
      clickTimer.current = null
      onSelect()
    } else {
      // Wait to see if it's a double click
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null
        // Single click — copy to clipboard
        navigator.clipboard.writeText(copyText).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        })
      }, 250)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border-2 cursor-grab active:cursor-grabbing relative',
        isDragging && 'opacity-50',
        copied && 'border-green-500',
        !copied && isSelected
          ? 'border-blue-500'
          : !copied && 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
      )}
    >
      {copied && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-lg pointer-events-none z-10">
          <span className="text-green-600 dark:text-green-400 text-xs font-semibold">Copied!</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.fileName && (
            <p className="text-xs text-zinc-500 mt-1 truncate">
              {task.fileName}
            </p>
          )}
          {task.description && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteTask(task.id)
            fetch('/api/tasks', {
              method: 'DELETE',
              body: JSON.stringify({ id: task.id }),
            })
          }}
          className="text-zinc-400 hover:text-red-500 text-xs p-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
