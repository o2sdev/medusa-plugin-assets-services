import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ASSETS_SERVICES_MODULE } from "../../../../modules/assets-services";
import AssetsServicesModuleService from "../../../../modules/assets-services/service";
import { PatchAdminUpdateServiceInstance } from "../validators";
import { z } from "zod";

type PatchAdminUpdateServiceInstanceType = z.infer<typeof PatchAdminUpdateServiceInstance>

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;
    
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data: serviceInstance } = await query.graph({
        entity: "service_instance",
        fields: ["*", "assets.*", "customer.*", "product_variant.*", "product_variant.product.*"],
        filters: {
            id: id
        }
    })

    if (!serviceInstance || serviceInstance.length === 0) {
        return res.status(404).json({
            message: "Service instance not found"
        })
    }

    return res.status(200).json({
        serviceInstance: serviceInstance[0]
    })
}

export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;
    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);

    await assetsServicesModuleService.deleteServiceInstances(id)

    return res.status(200).json({
        message: "Service instance deleted"
    })
}

export const PATCH = async (
    req: MedusaRequest<PatchAdminUpdateServiceInstanceType>,
    res: MedusaResponse
) => {
    const { id } = req.params;
    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);

    const updated = await assetsServicesModuleService.updateServiceInstances({
        id: id,
        ...req.validatedBody
    })

    return res.status(200).json({
        asset: updated
    })
}
