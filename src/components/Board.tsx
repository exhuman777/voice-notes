'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Task, TaskStatus, useTaskStore } from '@/lib/store'
import { Column } from './Column'
import { DropZone } from './DropZone'
import { FilePreview } from './FilePreview'
import { TaskCard } from './TaskCard'

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
]

export function Board() {
  const { tasks, setTasks, moveTask } = useTaskStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then(setTasks)
  }, [setTasks])

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    if (columns.some((c) => c.status === newStatus)) {
      const task = tasks.find((t) => t.id === taskId)
      if (task && task.status !== newStatus) {
        moveTask(taskId, newStatus)
        await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId, status: newStatus }),
        })
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 flex flex-col gap-4">
        <DropZone />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {columns.map(({ status, title }) => (
              <Column
                key={status}
                status={status}
                title={title}
                tasks={tasks.filter((t) => t.status === status)}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                isSelected={false}
                onSelect={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="lg:w-[400px] lg:min-w-[400px] bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3 text-zinc-600 dark:text-zinc-400">
          File Preview
        </h3>
        {selectedTask ? (
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg">
              <input
                type="text"
                value={selectedTask.title}
                onChange={async (e) => {
                  const newTitle = e.target.value
                  useTaskStore.getState().updateTask(selectedTask.id, { title: newTitle })
                  await fetch('/api/tasks', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedTask.id, title: newTitle }),
                  })
                }}
                className="w-full font-medium bg-transparent border-none outline-none"
              />
              <textarea
                value={selectedTask.description || ''}
                onChange={async (e) => {
                  const newDesc = e.target.value
                  useTaskStore.getState().updateTask(selectedTask.id, { description: newDesc })
                  await fetch('/api/tasks', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedTask.id, description: newDesc }),
                  })
                }}
                placeholder="Add description..."
                className="w-full text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-none outline-none resize-none mt-2"
                rows={3}
              />
            </div>
            <div className="h-[300px]">
              <FilePreview task={selectedTask} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-zinc-400">
            Select a task to preview
          </div>
        )}
      </div>
    </div>
  )
}
