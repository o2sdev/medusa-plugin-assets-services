import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createAssetWorkflow } from "../../../workflows/create-asset-workflow";
import { PostAdminCreateAsset } from "./validators";
import { z } from "@medusajs/framework/zod";

type PostAdminCreateAssetType = z.infer<typeof PostAdminCreateAsset>

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const { q, name, id } = req.query;

    const filters: any = {};
    if (id) {
        filters.id = id;
    }
    if (name) {
        filters.name = { $ilike: `%${name}%` };
    }

    if (q) {
        filters.q = q;
    }


    const { data: assets, metadata } = await query.graph({
        entity: "asset",
        fields: ["*", "address.*", "product_variant.*", "product_variant.product.*", "customer.*"],
        pagination: {
            skip: offset,
            take: limit
        },
        filters
    })

    return res.status(200).json({
        assets,
        count: metadata?.count,
        limit: metadata?.take,
        offset: metadata?.skip,
    })
}

export const POST = async (
    req: MedusaRequest<PostAdminCreateAssetType>,
    res: MedusaResponse
) => {
    const { name, thumbnail, serial_number, end_of_warranty_date, address, product_variant_id, customer_id, currency_code, region_id } = req.validatedBody;

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    // For some reason this does not work inside workflow
    const { data: product_variants } = await query.graph({
        entity: "product_variant",
        fields: ["id", "calculated_price.*"],
        filters: { id: product_variant_id },
        context: {
            calculated_price: QueryContext({
                region_id: region_id,
                currency_code: currency_code
            })
        }
    })

    const totals = product_variants[0]?.calculated_price?.calculated_amount ? {
        currency: currency_code,
        total_price: { value: product_variants[0]?.calculated_price?.calculated_amount}
    } : undefined

    const { result } = await createAssetWorkflow(req.scope)
        .run({
            input: {
                assetData: { name, thumbnail, serial_number, end_of_warranty_date, address, totals },
                variantId: product_variant_id,
                customerId: customer_id,
                currency_code: currency_code,
            }
        })

    return res.status(200).json({
        data: result
    })
}