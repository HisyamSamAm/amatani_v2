'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Input } from "@/components/shadcnUi/input"
import { Label } from "@/components/shadcnUi/label"
import { AspectRatio } from "@/components/shadcnUi/aspect-ratio"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/shadcnUi/alert"
import { Progress } from '@/components/shadcnUi/progress'
import Image from 'next/image'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/shadcnUi/alert-dialog'
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILES = 6;

export function ProductImageUpload({ onChange, value, error, mode }) {
  const fileInputRef = useRef(null)
  const [localError, setLocalError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateFile = useCallback((file) => {
    if (file.size > MAX_FILE_SIZE) {
      setLocalError(`Hanya boleh masukan gambar kurang dari 4MB.`)
      return false
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setLocalError(` Hanya menerima format gambar JPG, PNG, JPEG, or WebP.`)
      return false
    }
    setLocalError(null)
    return true
  }, [])

  const handleFiles = useCallback((selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(validateFile)

    if (validFiles.length > 0) {
      setIsLoading(true)
      setProgress(0)

      const processFiles = async () => {
        const newFiles = []
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]
          const preview = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(file)
          })
          newFiles.push(Object.assign(file, { preview }))
          setProgress(((i + 1) / validFiles.length) * 100)
        }
        onChange([...value, ...newFiles].slice(0, MAX_FILES))
        setIsLoading(false)
      }

      processFiles()
    }
  }, [onChange, validateFile, value])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const handleClick = useCallback(() => {
    if (value.length < MAX_FILES) {
      fileInputRef.current?.click()
    }
  }, [value.length])

  const removeFile = useCallback(async (fileToRemove) => {
    if (typeof fileToRemove === 'string') {
      // Hanya menghapus dari state lokal.
      // Penghapusan asli dari Vercel Blob dan DB akan di-handle oleh Server Action saat form di-submit.
      console.log('Image marked for removal');
    } else {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onChange(value.filter(file => file !== fileToRemove));
  }, [onChange, value]);

  return (
    <div className="w-full">
      <Label htmlFor="product-images" className="block text-sm font-medium text-gray-700 mb-2">
        Product Images
      </Label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {value && value.length < MAX_FILES ? (
          <>
            <Input
              id="product-images"
              type="file"
              className="hidden"
              onChange={handleChange}
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              ref={fileInputRef}
            />
            <p className="text-sm text-gray-500">
              Drag and drop product images here, or click to select files
            </p>
            <p className="text-xs text-gray-400 mt-1">
              (JPG, PNG, JPEG, WebP, max 4MB each, max 6 images)
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            Sudah mencapai batas maksimal
          </p>
        )}
      </div>
      {isLoading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">Processing images: {Math.round(progress)}%</p>
        </div>
      )}
      {(localError || error) && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-1">{localError || error}</AlertDescription>
        </Alert>
      )}
      <div className="mt-4 grid grid-cols-6 gap-4">
        {
          value.map((file, index) => (
            <div key={index} className="relative">
              <AspectRatio ratio={1 / 1} className="bg-muted">
                <Image
                  width={150}
                  height={150}
                  src={typeof file === 'string'
                    ? file
                    : file.preview}
                  alt={`Preview ${index + 1}`}
                  className="rounded-md object-cover w-full h-full border"
                />
              </AspectRatio>
              {typeof file === 'string' ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                      type="button"
                    >
                      &times;
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the image from storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeFile(file)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <button
                  onClick={() => removeFile(file)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>
          ))
        }
      </div>
    </div>
  )
}