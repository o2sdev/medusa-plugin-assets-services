import { ProductReferenceTypeEnum } from "../../../modules/assets-services/types";
import { z } from "@medusajs/framework/zod"

export const PostAdminCreateProductReference = z.object({
    referenceType: z.enum(Object.keys(ProductReferenceTypeEnum) as [string, ...string[]]),
    targetProducts: z.array(z.string()),
})