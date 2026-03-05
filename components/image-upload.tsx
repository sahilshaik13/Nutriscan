'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  onUpload: (imageData: string, mimeType: string) => void
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64Data = result.split(',')[1]
        onUpload(base64Data, file.type)
      }
      reader.readAsDataURL(file)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div
      {...getRootProps()}
      className={`
        flex h-16 cursor-pointer items-center justify-center gap-3 rounded-2xl border text-lg font-bold transition-all
        ${isDragActive 
          ? 'border-primary bg-primary/10 text-primary' 
          : 'border-border bg-card/50 text-foreground hover:bg-card/80'
        }
      `}
    >
      <input {...getInputProps()} />
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>
      <span>{isDragActive ? 'Drop Image' : 'Upload Image'}</span>
    </div>
  )
}
