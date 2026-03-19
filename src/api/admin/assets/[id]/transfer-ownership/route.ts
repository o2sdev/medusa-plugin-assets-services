import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { PostAdminTransferAssetOwnership } from "../../validators";
import { z } from "@medusajs/framework/zod";
import { updateLinksWorkflow } from "@medusajs/medusa/core-flows";
import { ASSETS_SERVICES_MODULE } from "../../../../../modules/assets-services";
import { Modules } from "@medusajs/framework/utils";

type PostAdminTransferAssetOwnershipType = z.infer<typeof PostAdminTransferAssetOwnership>

export const POST = async (
    req: MedusaRequest<PostAdminTransferAssetOwnershipType>,
    res: MedusaResponse
) => {
    const { id } = req.params;
    const { new_owner_id } = req.validatedBody;

    const { result } = await updateLinksWorkflow(req.scope)
        .run({
            input: [
                {
                    [ASSETS_SERVICES_MODULE]: { asset_id: id },
                    [Modules.CUSTOMER]: { customer_id: new_owner_id }
                }
            ]
        })

    return res.status(200).json({
        message: "Asset ownership transferred"
    })
}
