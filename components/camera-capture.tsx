'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, SwitchCamera, X } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageData: string, mimeType: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError(null)
    } catch {
      setError('Unable to access camera. Please ensure you have granted camera permissions.')
    }
  }, [facingMode, stream])

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        const base64Data = dataUrl.split(',')[1]
        onCapture(base64Data, 'image/jpeg')
      }
    }
  }, [onCapture])

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-destructive">{error}</p>
          <div className="flex gap-2">
            <Button onClick={startCamera}>Try Again</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full bg-background/80 backdrop-blur-sm"
          onClick={toggleCamera}
        >
          <SwitchCamera className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full"
          onClick={capturePhoto}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}
