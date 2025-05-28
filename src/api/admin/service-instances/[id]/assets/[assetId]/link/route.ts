import { container, MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ASSETS_SERVICES_MODULE } from "../../../../../../../modules/assets-services";
import AssetsServicesModuleService from "../../../../../../../modules/assets-services/service";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id, assetId } = req.params; 

    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);
    
    const serviceInstance = await assetsServicesModuleService.retrieveServiceInstance(id,{
        relations: ["assets"]
    })

    const existingAssetIds = serviceInstance.assets.map((asset) => asset.id);
    if (existingAssetIds.includes(assetId)) {
        return res.status(304).json({
            message: "Asset already linked to service instance"
        })
    }
    
    const modifiedAssets = [...existingAssetIds, assetId];

    await assetsServicesModuleService.updateServiceInstances({
        id,
        assets: modifiedAssets
    });

    return res.status(200).json({
        message: "Asset linked to service instance"
    })
}

export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const { id, assetId } = req.params; 

    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    
    const serviceInstance = await assetsServicesModuleService.retrieveServiceInstance(id,{
        relations: ["assets"]
    })

    logger.debug("Before filtering assets: " + serviceInstance.assets.length)

    const filteredAssets = serviceInstance.assets.filter((asset) => asset.id !== assetId).map((asset) => asset.id) ?? []

    logger.debug("Filtered assets: " + filteredAssets.length)

    await assetsServicesModuleService.updateServiceInstances({
        id,
        assets: filteredAssets
    });

    return res.status(200).json({
        message: "Asset unlinked from service instance"
    })
}