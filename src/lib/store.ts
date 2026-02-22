import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export interface Task {
  id: string
  title: string
  description?: string
  group: string
  filePath?: string
  fileName?: string
  fileType?: string
  transcription?: string
  createdAt: string
}

interface TaskStore {
  tasks: Task[]
  groups: string[]
  setTasks: (tasks: Task[]) => void
  setGroups: (groups: string[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (id: string, group: string) => void
  deleteTask: (id: string) => void
  addGroup: (name: string) => void
  deleteGroup: (name: string) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  groups: ['Work', 'Personal', 'Prompts', 'Ideas'],

  setTasks: (tasks) => set({ tasks }),
  setGroups: (groups) => set({ groups }),

  addTask: (taskData) => {
    const task: Task = {
      ...taskData,
      id: uuid(),
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ tasks: [...state.tasks, task] }))
    return task
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  moveTask: (id, group) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, group } : t)),
    }))
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
  },

  addGroup: (name) => {
    set((state) => ({
      groups: state.groups.includes(name) ? state.groups : [...state.groups, name],
    }))
  },

  deleteGroup: (name) => {
    set((state) => ({
      groups: state.groups.filter((g) => g !== name),
      tasks: state.tasks.map((t) => (t.group === name ? { ...t, group: 'Work' } : t)),
    }))
  },
}))
