'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { createService } from './actions'
import { uploadServiceImage } from '@/app/actions/upload'
import { toast } from 'sonner'

export function AddServiceButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    setUploading(true)

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadServiceImage(formData)

    if (result.error) {
      toast.error(result.error)
      setImagePreview('')
    } else if (result.url) {
      setImageUrl(result.url)
      toast.success('Image uploaded!')
    }
    setUploading(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  function clearImage() {
    setImageUrl('')
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function resetForm() {
    setImageUrl('')
    setImagePreview('')
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    // Add the uploaded image URL to form data
    if (imageUrl) {
      formData.set('imageUrl', imageUrl)
    }

    const result = await createService(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Service created successfully!')
      setOpen(false)
      resetForm()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm() }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service that will be visible to customers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input id="name" name="name" className="col-span-3" required placeholder="e.g., Haircut" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category *
              </Label>
              <Input id="category" name="category" className="col-span-3" required placeholder="Hair, Spa, Nail, etc." />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (₹) *
              </Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" className="col-span-3" required placeholder="500" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (min) *
              </Label>
              <Input id="duration" name="duration" type="number" min="1" className="col-span-3" required placeholder="30" />
            </div>

            {/* Image Upload */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Image
              </Label>
              <div className="col-span-3 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview || imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview || imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5MB • JPEG, PNG, WebP, GIF
                    </p>
                  </div>
                )}

                {/* Hidden input for form submission */}
                <input type="hidden" name="imageUrl" value={imageUrl} />
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-3"
                placeholder="Brief description of the service..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
