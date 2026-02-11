'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  isProcessing?: boolean
}

export function VoiceRecorder({ onRecordingComplete, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available:', e.data.size)
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunksRef.current.length)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        console.log('Created blob:', blob.size, 'bytes')
        if (blob.size > 0) {
          onRecordingComplete(blob)
        } else {
          console.error('Empty recording!')
          alert('Recording was empty, try again')
        }
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // collect data every second
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    } catch (err) {
      console.error('Mic access denied:', err)
      alert('Microphone access required for recording')
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (isProcessing) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        Transcribing...
      </Button>
    )
  }

  if (isRecording) {
    return (
      <Button variant="destructive" onClick={stopRecording} className="animate-pulse">
        <Square className="w-4 h-4" />
        Stop {formatTime(duration)}
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={startRecording}>
      <Mic className="w-4 h-4" />
      Record
    </Button>
  )
}
