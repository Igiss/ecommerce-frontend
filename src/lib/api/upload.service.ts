import { ApiError, apiClient } from './client'

export type UploadType = 'avatar' | 'product_image' | 'review_image'

interface UploadSignatureResponse {
  uploadId: string
  uploadUrl: string
  apiKey: string
  parameters: Record<string, string | number | boolean>
  signature: string
}

export interface CompletedUpload {
  id: string
  url: string
  mimeType: string
  size: number
  type: UploadType
  status: 'active'
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadImage(file: File, type: UploadType): Promise<CompletedUpload> {
  validateImage(file, type)

  const signedUpload = await apiClient<UploadSignatureResponse>('/upload/signature', {
    method: 'POST',
    body: JSON.stringify({
      type,
      originalName: file.name,
      mimeType: file.type,
      size: file.size
    })
  })

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', signedUpload.apiKey)
  formData.append('signature', signedUpload.signature)

  Object.entries(signedUpload.parameters).forEach(([key, value]) => {
    formData.append(key, String(value))
  })

  const cloudinaryResponse = await fetch(signedUpload.uploadUrl, {
    method: 'POST',
    body: formData
  })

  if (!cloudinaryResponse.ok) {
    let message = 'Không thể tải ảnh lên Cloudinary.'
    try {
      const error = await cloudinaryResponse.json() as { error?: { message?: string } }
      message = error.error?.message || message
    } catch {
      // Keep the user-facing fallback message.
    }
    throw new ApiError(message, cloudinaryResponse.status)
  }

  return apiClient<CompletedUpload>('/upload/complete', {
    method: 'POST',
    body: JSON.stringify({ uploadId: signedUpload.uploadId })
  })
}

export function uploadProductImages(files: File[]) {
  if (files.length > 10) {
    throw new Error('Mỗi sản phẩm chỉ được tải tối đa 10 ảnh.')
  }
  return Promise.all(files.map((file) => uploadImage(file, 'product_image')))
}

function validateImage(file: File, type: UploadType) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.')
  }

  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`Ảnh không được vượt quá ${maxSize / 1024 / 1024} MB.`)
  }
}
