'use client'

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={cn(
        'p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border-2 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50',
        isSelected
          ? 'border-blue-500'
          : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.fileName && (
            <p className="text-xs text-zinc-500 mt-1 truncate">
              📎 {task.fileName}
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
