import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { ASSETS_SERVICES_MODULE } from "../modules/assets-services";
import { Modules } from "@medusajs/framework/utils";
import { updateRemoteLinksStep } from "@medusajs/core-flows";

export const transferServiceInstanceOwnershipWorkflow = createWorkflow(
    "transfer-service-instance-ownership",
    (input: { serviceInstanceId: string, newOwnerId: string }) => {

        const links = [
            {
                [ASSETS_SERVICES_MODULE]: { service_instance_id: input.serviceInstanceId },
                [Modules.CUSTOMER]: { customer_id: input.newOwnerId }
            }
        ]

        const result = updateRemoteLinksStep(links as any)

        return new WorkflowResponse(result)
    }
)