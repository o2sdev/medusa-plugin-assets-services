import { ProductReferenceTypeEnum } from "../../../modules/assets-services/types";
import { z } from "zod"

export const PostAdminCreateProductReference = z.object({
    referenceType: z.enum(Object.keys(ProductReferenceTypeEnum) as [string, ...string[]]),
    targetProducts: z.array(z.string()),
})