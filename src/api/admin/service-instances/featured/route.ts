import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    
    const { data: products, metadata } = await query.graph({
        entity: "product",
        fields: ["*", "variants.*"],
        filters: {
            categories: {
                handle: "featured-services"
            }
        }
    })

    const variants = products.map((product) => product.variants).flat();

    return res.json({
        featuredServices: variants,
        count: variants.length,
    })
}