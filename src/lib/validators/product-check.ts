import { z } from "zod";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB as base64

const ImageInputSchema = z.object({
  data: z
    .string()
    .min(1, "Image data is required")
    .refine(
      (data) => {
        // Rough base64 size check: base64 is ~4/3 of original
        const estimatedBytes = (data.length * 3) / 4;
        return estimatedBytes <= MAX_IMAGE_SIZE_BYTES;
      },
      { message: "Image exceeds 10MB size limit" },
    ),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    error: `Supported formats: ${ALLOWED_MIME_TYPES.join(", ")}`,
  }),
});

export const ProductCheckInputSchema = z.object({
  images: z
    .array(ImageInputSchema)
    .min(1, "At least 1 image is required")
    .max(2, "Maximum 2 images allowed"),
  language: z.enum(["ko", "en"]).default("ko"),
});

export type ProductCheckInput = z.infer<typeof ProductCheckInputSchema>;
