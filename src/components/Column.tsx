'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/lib/store'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface ColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
}

const columnColors: Record<TaskStatus, string> = {
  todo: 'bg-zinc-100 dark:bg-zinc-800',
  in_progress: 'bg-blue-50 dark:bg-blue-900/20',
  done: 'bg-green-50 dark:bg-green-900/20',
}

const headerColors: Record<TaskStatus, string> = {
  todo: 'text-zinc-700 dark:text-zinc-300',
  in_progress: 'text-blue-700 dark:text-blue-300',
  done: 'text-green-700 dark:text-green-300',
}

export function Column({ status, title, tasks, selectedTaskId, onSelectTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl p-3 min-h-[200px] transition-colors',
        columnColors[status],
        isOver && 'ring-2 ring-blue-400'
      )}
    >
      <h2 className={cn('font-semibold text-sm mb-3 px-1', headerColors[status])}>
        {title} <span className="text-zinc-400">({tasks.length})</span>
      </h2>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={() => onSelectTask(task.id)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
