import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { transferServiceInstanceOwnershipWorkflow } from "../../../../../workflows/transfer-service-instance-ownership-workflow";
import { PostAdminTransferServiceInstanceOwnership } from "../../validators";
import { z } from "zod";

type PostAdminTransferServiceInstanceOwnershipType = z.infer<typeof PostAdminTransferServiceInstanceOwnership>

export const POST = async (req: MedusaRequest<PostAdminTransferServiceInstanceOwnershipType>, res: MedusaResponse) => {
    const { id } = req.params;
    const { new_owner_id } = req.validatedBody;

    const { result } = await transferServiceInstanceOwnershipWorkflow(req.scope)
        .run({
            input: {
                serviceInstanceId: id,
                newOwnerId: new_owner_id
            }
        })

    return res.status(200).json({
        message: "Service instance ownership transferred"
    })
}