import { MedusaRequest } from "@medusajs/framework/http";

import { MedusaResponse } from "@medusajs/framework/http";
import { ASSETS_SERVICES_MODULE } from "../../../../../modules/assets-services";
import AssetsServicesModuleService from "../../../../../modules/assets-services/service";

export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const assetsServicesModuleService: AssetsServicesModuleService = req.scope.resolve(ASSETS_SERVICES_MODULE);

    const referenceId = req.params.id;


    await assetsServicesModuleService.deleteProductVariantReferences(referenceId)

    return res.status(200).json({
        message: "Product reference deleted"
    })
}
