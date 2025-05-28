import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data: asset } = await query.graph({
        entity: "asset",
        fields: ["product_variant.id", "product_variant.product.id"],
        filters: {
            id: id
        }
    })
    
    if (!asset || asset.length === 0) {
        return res.status(404).json({
            message: "Asset not found"
        })
    }

    const productId = asset[0].product_variant.product.id
    const variantId = asset[0].product_variant.id
    
    const { data: compatibleServices, metadata } = await query.graph({
        entity: "product_variant_reference",
        fields: ["id", "source_product_variant_id", "target_product_variant_id", "reference_type"],
        filters: {
            source_product_variant_id: variantId,
            reference_type: "COMPATIBLE_SERVICE"
        },
        pagination: {
            skip: offset,
            take: limit
        },
    })

    const { data: products } = await query.graph({
        entity: "product_variant",
        fields: ["id", "title", "sku", "ean", "product.id", "product.title", "product.thumbnail", "product.description", "prices.*"],
        filters: {
            id: compatibleServices.map((reference) => reference.target_product_variant_id)
        },
    })

    return res.status(200).json({
        compatibleServices: products,
        count: metadata?.count,
        limit: metadata?.take,
        offset: metadata?.skip,
    })
}