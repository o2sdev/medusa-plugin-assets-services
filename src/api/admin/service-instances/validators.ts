import { z } from "zod"

export const PatchAdminUpdateServiceInstance = z.object({
    name: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
    payment_type: z.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    start_date: z.string().datetime().transform((val) => new Date(val)).optional(),
    end_date: z.string().datetime().transform((val) => new Date(val)).nullable().optional(),
    purchase_date: z.string().datetime().transform((val) => new Date(val)).nullable().optional(),
    totals: z.any().nullable().optional(),
})

export const PostAdminCreateServiceInstance = z.object({
    name: z.string(),
    payment_type: z.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "YEARLY"]),
    customer_id: z.string(),
    product_variant_id: z.string(),
    start_date: z.string().datetime().transform((val) => new Date(val)),
    end_date: z.string().datetime().transform((val) => new Date(val)).optional(),
    assets: z.array(z.string()).optional(),
    currency_code: z.string(),
    region_id: z.string(),
})

export const PostAdminTransferServiceInstanceOwnership = z.object({
    new_owner_id: z.string(),
})