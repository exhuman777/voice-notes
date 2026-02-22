'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Task, useTaskStore } from '@/lib/store'
import { isAudioFile, getFileType } from '@/lib/utils'

const PRIMARY_LANGUAGES = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
]

const MORE_LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'sv', label: 'Svenska' },
  { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'cs', label: 'Čeština' },
  { code: 'ro', label: 'Română' },
  { code: 'hu', label: 'Magyar' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'he', label: 'עברית' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
]

const ALL_LANGUAGES = [...PRIMARY_LANGUAGES, ...MORE_LANGUAGES]

export default function Home() {
  const { tasks, groups, setTasks, addTask, moveTask, deleteTask, updateTask, addGroup, deleteGroup } = useTaskStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [showGroupPicker, setShowGroupPicker] = useState(false)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [language, setLanguage] = useState('pl')
  const [showLangPanel, setShowLangPanel] = useState(false)
  const [showMoreLangs, setShowMoreLangs] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const clickTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('voice-notes-lang')
    if (saved) setLanguage(saved)
  }, [])

  const changeLang = (code: string) => {
    setLanguage(code)
    localStorage.setItem('voice-notes-lang', code)
    setShowLangPanel(false)
  }

  useEffect(() => {
    fetch('/api/tasks').then((res) => res.json()).then((data) => {
      const migrated = data.map((t: any) => ({
        ...t,
        group: t.group || (t.status === 'done' ? 'Done' : t.status === 'in_progress' ? 'Work' : 'Inbox'),
      }))
      setTasks(migrated)
    })
  }, [setTasks])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const handleCardClick = (task: Task) => {
    if (clickTimers.current[task.id]) {
      // Double click — open preview
      clearTimeout(clickTimers.current[task.id])
      delete clickTimers.current[task.id]
      setSelectedTask(task)
    } else {
      // Wait to distinguish single vs double
      clickTimers.current[task.id] = setTimeout(() => {
        delete clickTimers.current[task.id]
        // Single click — copy
        const text = task.transcription || task.description || task.title
        navigator.clipboard.writeText(text).then(() => {
          setCopiedId(task.id)
          setTimeout(() => setCopiedId(null), 1200)
        })
      }, 250)
    }
  }

  const saveRecording = async (blob: Blob, group: string) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      formData.append('language', language)
      const res = await fetch('/api/record', { method: 'POST', body: formData })
      const { filePath, fileName, transcription } = await res.json()

      const task = addTask({
        title: transcription?.slice(0, 60) || 'Voice Note',
        description: transcription,
        group,
        filePath, fileName,
        fileType: 'audio',
        transcription,
      })

      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      })
    } finally {
      setIsUploading(false)
      setPendingBlob(null)
      setShowGroupPicker(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        if (blob.size > 0) {
          setPendingBlob(blob)
          setShowGroupPicker(true)
        }
      }

      recorder.start(1000)
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)
    } catch {
      alert('Microphone access required')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setMediaRecorder(null)
      setIsRecording(false)
    }
  }

  const handleFile = useCallback(async (file: File, group: string = 'Inbox') => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      const { filePath, savedAs, fileName } = await uploadRes.json()

      let transcription: string | undefined
      if (isAudioFile(file.name)) {
        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: savedAs, language }),
        })
        transcription = (await transcribeRes.json()).transcription
      }

      const task = addTask({
        title: transcription?.slice(0, 60) || file.name,
        description: transcription,
        group,
        filePath, fileName,
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
  }, [addTask, language])

  const handleDrop = (e: React.DragEvent, targetGroup?: string) => {
    e.preventDefault()

    if (draggedTask && targetGroup && draggedTask.group !== targetGroup) {
      moveTask(draggedTask.id, targetGroup)
      fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draggedTask.id, group: targetGroup }),
      })
      setDraggedTask(null)
      return
    }

    Array.from(e.dataTransfer.files).forEach(f => handleFile(f, targetGroup || 'Inbox'))
  }

  const handleDelete = async (task: Task) => {
    deleteTask(task.id)
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id }),
    })
    if (selectedTask?.id === task.id) setSelectedTask(null)
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim())
      setNewGroupName('')
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const currentLang = ALL_LANGUAGES.find(l => l.code === language)

  return (
    <main className="app">
      {/* Header */}
      <header className="header">
        <h1>Voice Notes</h1>
        <div className="header-actions">
          <div className="lang-wrapper">
            <button
              className="btn btn-lang"
              onClick={() => setShowLangPanel(!showLangPanel)}
              title="Transcription language"
            >
              {currentLang?.label || 'Auto'}
            </button>
            {showLangPanel && (
              <div className="lang-panel">
                <div className="lang-panel-title">Transcription Language</div>
                <div className="lang-grid">
                  {PRIMARY_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-option primary ${language === l.code ? 'active' : ''}`}
                      onClick={() => changeLang(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <button
                  className="lang-more-btn"
                  onClick={() => setShowMoreLangs(!showMoreLangs)}
                >
                  {showMoreLangs ? 'Less' : 'More languages...'}
                </button>
                {showMoreLangs && (
                  <div className="lang-grid">
                    {MORE_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-option ${language === l.code ? 'active' : ''}`}
                        onClick={() => changeLang(l.code)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {isRecording ? (
            <button className="btn btn-stop" onClick={stopRecording}>
              Stop {formatTime(recordingTime)}
            </button>
          ) : (
            <button className="btn btn-record" onClick={startRecording} disabled={isUploading}>
              Record
            </button>
          )}
        </div>
      </header>

      {/* Click outside to close lang panel */}
      {showLangPanel && <div className="lang-backdrop" onClick={() => setShowLangPanel(false)} />}

      {/* Group Picker Modal */}
      {showGroupPicker && (
        <div className="modal-overlay" onClick={() => setShowGroupPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Select Group</h3>
            <div className="group-picker">
              {groups.map((g) => (
                <button
                  key={g}
                  className="group-btn"
                  onClick={() => pendingBlob && saveRecording(pendingBlob, g)}
                  disabled={isUploading}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="new-group">
              <input
                type="text"
                placeholder="New group..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newGroupName.trim()) {
                    addGroup(newGroupName.trim())
                    if (pendingBlob) saveRecording(pendingBlob, newGroupName.trim())
                  }
                }}
              />
              <button onClick={handleAddGroup} disabled={!newGroupName.trim()}>+</button>
            </div>
            {isUploading && <p className="uploading">Transcribing...</p>}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="groups-grid">
        {groups.map((group) => {
          const groupTasks = sortedTasks.filter((t) => t.group === group)
          return (
            <div
              key={group}
              className="group-column"
              onDrop={(e) => handleDrop(e, group)}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="group-header">
                <span className="group-name">{group}</span>
                <span className="group-count">{groupTasks.length}</span>
                {group !== 'Inbox' && (
                  <button className="delete-group" onClick={() => deleteGroup(group)}>×</button>
                )}
              </div>

              <div className="tasks-list">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card ${selectedTask?.id === task.id ? 'selected' : ''} ${draggedTask?.id === task.id ? 'dragging' : ''} ${copiedId === task.id ? 'copied' : ''}`}
                    draggable
                    onDragStart={() => setDraggedTask(task)}
                    onDragEnd={() => setDraggedTask(null)}
                    onClick={() => handleCardClick(task)}
                  >
                    {copiedId === task.id && (
                      <div className="copied-overlay">Copied!</div>
                    )}
                    <div className="task-title">{task.title}</div>
                    {task.transcription && (
                      <div className="task-preview">{task.transcription}</div>
                    )}
                    <div className="task-meta">
                      {task.fileType === 'audio' && '🎵'}
                      {task.fileType === 'image' && '🖼'}
                      {task.fileType === 'video' && '🎬'}
                      <span className="task-date">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Add Group Column */}
        <div className="group-column add-group-column">
          <input
            type="text"
            placeholder="+ New Group"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
          />
          <button onClick={handleAddGroup} disabled={!newGroupName.trim()}>Add</button>
        </div>
      </div>

      {/* Preview Panel */}
      {selectedTask && (
        <div className="preview-panel">
          <button className="close-preview" onClick={() => setSelectedTask(null)}>×</button>
          <input
            type="text"
            className="preview-title"
            value={selectedTask.title}
            onChange={(e) => {
              const title = e.target.value
              updateTask(selectedTask.id, { title })
              setSelectedTask({ ...selectedTask, title })
              fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedTask.id, title }),
              })
            }}
          />

          {selectedTask.filePath && selectedTask.fileType === 'audio' && (
            <audio controls src={selectedTask.filePath} />
          )}
          {selectedTask.filePath && selectedTask.fileType === 'image' && (
            <img src={selectedTask.filePath} alt="" />
          )}

          <textarea
            value={selectedTask.description || selectedTask.transcription || ''}
            onChange={(e) => {
              const description = e.target.value
              updateTask(selectedTask.id, { description })
              setSelectedTask({ ...selectedTask, description })
              fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedTask.id, description }),
              })
            }}
            placeholder="Notes..."
          />

          <select
            value={selectedTask.group}
            onChange={(e) => {
              const group = e.target.value
              moveTask(selectedTask.id, group)
              setSelectedTask({ ...selectedTask, group })
              fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedTask.id, group }),
              })
            }}
          >
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button className="btn-delete" onClick={() => handleDelete(selectedTask)}>
            Delete
          </button>
        </div>
      )}
    </main>
  )
}
