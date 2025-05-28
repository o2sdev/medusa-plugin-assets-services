import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import AssetsServicesModuleService from "../../../../../../../modules/assets-services/service";
import { ASSETS_SERVICES_MODULE } from "../../../../../../../modules/assets-services";
import { PostAdminCreateProductReference } from "../../../../validators";
import { z } from "zod";

type ProductReferenceMethodsType = z.infer<typeof PostAdminCreateProductReference>

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const variantId = req.params.variantId
    const referenceType = req.query.referenceType

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const { data: productReferences, metadata } = await query.graph({
        entity: "product_variant_reference",
        fields: ["id", "source_product_variant_id", "target_product_variant_id", "reference_type"],
        filters: {
            source_product_variant_id: variantId,
            ...(referenceType ? { reference_type: referenceType } : {})
        },
        pagination: {
            skip: offset,
            take: limit
        },
    })

    const { data: products } = await query.graph({
        entity: "product_variant",
        fields: ["id", "title", "sku", "ean", "product.id", "product.title", "product.thumbnail", "product.description"],
        filters: {
            id: productReferences.map((reference) => reference.target_product_variant_id)
        },
    })

    const productReferencesWithProducts = productReferences.map((reference) => {
        const product = products.find((product) => product.id === reference.target_product_variant_id);
        return {
            ...reference,
            targetProduct: {
                ...product,
            }
        }
    })

    return res.status(200).json({
        productReferences: productReferencesWithProducts,
        count: metadata?.count,
        limit: metadata?.take,
        offset: metadata?.skip,
    })
}


export const POST = async (
    req: MedusaRequest<ProductReferenceMethodsType>,
    res: MedusaResponse
) => {
    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);

    const sourceProductId = req.params.id;
    const sourceProductVariantId = req.params.variantId;
    const targetProductIds = req.validatedBody.targetProducts;
    const referenceType = req.validatedBody.referenceType;
    if (typeof targetProductIds === 'undefined' || typeof sourceProductId === 'undefined' || typeof sourceProductVariantId === 'undefined') {
        return res.status(400).json({error: "Product ID and related product IDs are required"});
    }


    const createdProductReferences: any[] = [];

    try {
        for (const product of targetProductIds) {
            //@ts-ignore
            const productReference = await assetsServicesModuleService.createProductVariantReferences({
                source_product_variant_id: sourceProductVariantId,
                target_product_variant_id: product,
                metadata: null,
                reference_type: referenceType
            })
            createdProductReferences.push(productReference);
        }
    } catch (error) {
        return res.status(304).json({error: "Product references already exist"});
    }

    return res.status(200).json({
        productReferences: createdProductReferences
    })
}