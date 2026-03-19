import { z } from "@medusajs/framework/zod"

export const PatchAdminUpdateAsset = z.object({
  name: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  serial_number: z.string().optional(),
  end_of_warranty_date: z.string().datetime().transform((val) => new Date(val)).nullable().optional(),
  totals: z.any().nullable().optional(),
})

export const PostAdminCreateAsset = z.object({
  name: z.string(),
  product_variant_id: z.string(),
  customer_id: z.string(),
  thumbnail: z.string().optional(),
  serial_number: z.string(),
  end_of_warranty_date: z.string().datetime().transform((val) => new Date(val)).optional(),
  totals: z.any().optional().nullable(),
  currency_code: z.string(),
  region_id: z.string(),
  address: z.object({
    address_1: z.string(),
    city: z.string(),
    country_code: z.string(),
    postal_code: z.string(),
    province: z.string(),
    phone: z.string().optional(),
  }),
  
})


export const PostAdminTransferAssetOwnership = z.object({
  new_owner_id: z.string(),
})