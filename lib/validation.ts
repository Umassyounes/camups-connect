/**
 * Input validation and sanitization utilities
 * This file contains utility functions for validation
 * For Zod schemas, see validation-schemas.ts
 */

// ============================================
// STRING UTILITIES
// ============================================

export function sanitizeString(input: string | null | undefined, maxLength: number = 1000): string {
  if (!input) return ""
  return input.trim().slice(0, maxLength)
}

// Prevent XSS by escaping HTML
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (s) => map[s])
}

export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts and special characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255)
}

// ============================================
// BASIC VALIDATORS
// ============================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateInteger(value: unknown, min?: number, max?: number): number | null {
  const num = parseInt(String(value))
  if (isNaN(num)) return null
  if (min !== undefined && num < min) return null
  if (max !== undefined && num > max) return null
  return num
}

export function validateDate(dateString: string): Date | null {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  return date
}

// ============================================
// FILE VALIDATORS
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg']

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxBytes
}

export function validateImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())
}

export function validateAudioFile(file: File): boolean {
  return ALLOWED_AUDIO_TYPES.includes(file.type.toLowerCase())
}

// ============================================
// RATE LIMITING (Simple in-memory implementation)
// For production, consider using Redis
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Clean up old rate limit records periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 300000) // Clean up every 5 minutes
}
