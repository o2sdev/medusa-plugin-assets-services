import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const variantId = req.params.variantId
  const referenceType = req.query.referenceType

  const limit = Number(req.query.limit) || 10
  const offset = Number(req.query.offset) || 0

  const { data: productReferences, metadata } = await query.graph({
    entity: "product_variant_reference",
    fields: [
      "id",
      "source_product_variant_id",
      "target_product_variant_id",
      "reference_type",
    ],
    filters: {
      source_product_variant_id: variantId,
      ...(referenceType ? { reference_type: referenceType } : {}),
    },
    pagination: {
      skip: offset,
      take: limit,
    },
  })

  const { data: products } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "title",
      "sku",
      "ean",
      "product.id",
      "product.title",
      "product.thumbnail",
      "product.description",
    ],
    filters: {
      id: productReferences.map((reference) => reference.target_product_variant_id),
    },
  })

  const productReferencesWithProducts = productReferences.map((reference) => {
    const product = products.find(
      (product) => product.id === reference.target_product_variant_id
    )

    return {
      ...reference,
      targetProduct: {
        ...product,
      },
    }
  })

  return res.status(200).json({
    productReferences: productReferencesWithProducts,
    count: metadata?.count,
    limit: metadata?.take,
    offset: metadata?.skip,
  })
}
