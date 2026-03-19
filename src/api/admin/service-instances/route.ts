import { ContainerRegistrationKeys, QueryContext } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import ServiceInstanceCustomerLink from "../../../links/service-instance-customer";
import { PostAdminCreateServiceInstance } from "./validators";
import { z } from "@medusajs/framework/zod";
import { createServiceInstanceWorkflow } from "../../../workflows/create-service-instance-workflow";
type PostAdminCreateServiceInstanceType = z.infer<typeof PostAdminCreateServiceInstance>

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const { customerId } = req.query;
    const { q, payment_type, status } = req.query;

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const filters: any = {}
    if (customerId) {
        const { data: serviceInstances } = await query.graph({
            entity: ServiceInstanceCustomerLink.entryPoint,
            fields: ["service_instance_id"],
            filters: {
                customer_id: customerId
            }
        })
        filters.id = serviceInstances.map((si: any) => si.service_instance_id)
    }

    if (q) {
        filters.q = q
    }

    if (payment_type) {
        filters.payment_type = payment_type
    }

    if (status) {
        filters.status = status
    }


    const { data: serviceInstances, metadata } = await query.graph({
        entity: "service_instance",
        fields: ["*", "customer.email", "assets.product_variant.id", "assets.product_variant.product.id", "product_variant.id", "product_variant.product.id"],
        pagination: {
            skip: offset,
            take: limit
        },
        filters
    })

    return res.status(200).json({
        serviceInstances,
        count: metadata?.count,
        limit: metadata?.take,
        offset: metadata?.skip,
    })
}

export const POST = async (
    req: MedusaRequest<PostAdminCreateServiceInstanceType>,
    res: MedusaResponse
) => {
    const { name, payment_type, customer_id, product_variant_id, start_date, end_date, assets, currency_code, region_id } = req.validatedBody;

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

    const { result } = await createServiceInstanceWorkflow(req.scope)
        .run({
            input: {
                serviceInstanceData: { name, payment_type, start_date, end_date, status: "ACTIVE", totals, assets },
                customerId: customer_id,
                productVariantId: product_variant_id
            }
        })

    return res.status(200).json({
        result
    })
}

