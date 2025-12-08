'use server'

import { createClient } from '@/utils/supabase/server'

export async function uploadServiceImage(formData: FormData) {
    try {
        const file = formData.get('file') as File
        if (!file || file.size === 0) {
            return { error: 'No file provided' }
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            return { error: 'File too large. Maximum size is 5MB.' }
        }

        const supabase = await createClient()

        // Convert File to ArrayBuffer then to Buffer for server-side upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Generate unique filename
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `service-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `services/${fileName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            // Check if bucket doesn't exist
            if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
                return { error: 'Storage bucket "images" not found. Please create it in Supabase Dashboard > Storage.' }
            }
            return { error: `Upload failed: ${uploadError.message}` }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)

        return { success: true, url: publicUrl }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload image. Make sure the "images" bucket exists in Supabase Storage.' }
    }
}
