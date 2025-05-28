import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { ASSETS_SERVICES_MODULE } from "../../../../modules/assets-services";
import AssetsServicesModuleService from "../../../../modules/assets-services/service";
import { PatchAdminUpdateAsset } from "../../assets/validators";
import { z } from "zod";

type PatchAdminUpdateAssetType = z.infer<typeof PatchAdminUpdateAsset>

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

    const { data: asset } = await query.graph({
        entity: "asset",
        fields: ["*", "address.*", "product_variant.*", "product_variant.product.*", "customer.*", "service_instances.*"],
        filters: {
            id: id
        }
    })
    
    if (!asset || asset.length === 0) {
        return res.status(404).json({
            message: "Asset not found"
        })
    }
    
    return res.status(200).json({
        asset: asset[0]
    })
}

export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id } = req.params;
    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);

    await assetsServicesModuleService.deleteAssets(id)

    return res.status(200).json({
        message: "Asset deleted"
    })
}

export const PATCH = async (
    req: MedusaRequest<PatchAdminUpdateAssetType>,
    res: MedusaResponse
) => {
    const { id } = req.params;
    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);

    const updated = await assetsServicesModuleService.updateAssets({
        id: id,
        ...req.validatedBody
    })

    return res.status(200).json({
        asset: updated
    })
}