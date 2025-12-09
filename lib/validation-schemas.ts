import { z } from "zod"

/**
 * Zod schemas for API input validation
 */

const paymentMethodEnum = z.enum(["venmo", "cashapp", "zelle", "cash"])
const sponsoredEventTierEnum = z.enum(["spotlight", "featured", "community"])

// Listing schemas
export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  priceCents: z.number().int().min(0).max(100000000), // Max $1,000,000
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  imageUrl: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  campus: z.string().max(100).optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  paymentMethods: z
    .array(paymentMethodEnum)
    .optional()
    .default([]),
})

export const updateListingSchema = createListingSchema.partial().extend({
  isSold: z.boolean().optional(),
})

export type CreateListingInput = z.infer<typeof createListingSchema>

export const markListingAsSoldSchema = z.object({
  isSold: z.boolean(),
})

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
})

export const updateEventSchema = createEventSchema.partial()

export const sponsoredEventRequestSchema = z.object({
  tier: sponsoredEventTierEnum,
  sponsorName: z.string().min(2).max(120),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().min(7).max(20).optional().nullable(),
  promoUrl: z.string().url().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

// Message schemas
export const createMessageSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  messageType: z.enum(["TEXT", "PHOTO", "VOICE"]).default("TEXT"),
  mediaUrl: z.string().url().optional().nullable(),
})

export const createConversationSchema = z.object({
  listingId: z.number().int().positive(),
  sellerId: z.number().int().positive(),
})

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  year: z.string().max(20).optional().nullable(),
  major: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["image", "audio"]),
})

/**
 * Middleware to validate request body against a schema
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: string; details?: z.ZodError }> {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "Validation failed",
        details: error,
      }
    }
    return { error: "Invalid request body" }
  }
}

/**
 * Middleware to validate FormData against a schema
 */
export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
): { data: T } | { error: string; details?: z.ZodError } {
  try {
    const obj: any = {}
    formData.forEach((value, key) => {
      obj[key] = value
    })
    const data = schema.parse(obj)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: "Validation failed",
        details: error,
      }
    }
    return { error: "Invalid form data" }
  }
}
