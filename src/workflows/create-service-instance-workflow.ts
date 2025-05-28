import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ASSETS_SERVICES_MODULE } from "../modules/assets-services"
import AssetsServicesModuleService from "../modules/assets-services/service"
import { Modules } from "@medusajs/framework/utils"
import { createRemoteLinkStep } from "@medusajs/medusa/core-flows"

type CreateServiceInstanceInput = {
  name: string
  start_date: Date
  end_date?: Date
  purchase_date?: Date
  payment_type: "ONE_TIME" | "WEEKLY" | "MONTHLY" | "YEARLY"
  status: "ACTIVE" | "INACTIVE" | "EXPIRED",
  totals?: Record<string, unknown>,
  assets?: string[]
}

const createServiceInstanceStep = createStep(
  "create-service-instance",
  async (input: CreateServiceInstanceInput, { container }) => {
    const assetsServicesModuleService: AssetsServicesModuleService = container.resolve(ASSETS_SERVICES_MODULE)
    const serviceInstance = await assetsServicesModuleService.createServiceInstances(input)
    return new StepResponse(serviceInstance, serviceInstance)
  },
  async (serviceInstance, { container }) => {
    const assetsServicesModuleService: AssetsServicesModuleService = container.resolve(ASSETS_SERVICES_MODULE)
    if (serviceInstance) {
      await assetsServicesModuleService.deleteServiceInstances(serviceInstance.id)
    }
  }
)

export const createServiceInstanceWorkflow = createWorkflow(
  "create-service-instance",
  (input: { serviceInstanceData: CreateServiceInstanceInput, customerId: string, productVariantId: string }) => {
    const serviceInstance = createServiceInstanceStep(input.serviceInstanceData)

    createRemoteLinkStep([
        {
          [ASSETS_SERVICES_MODULE]: { service_instance_id: serviceInstance.id },
          [Modules.CUSTOMER]: { customer_id: input.customerId },
        },
        {
          [ASSETS_SERVICES_MODULE]: { service_instance_id: serviceInstance.id },
          [Modules.PRODUCT]: { product_variant_id: input.productVariantId },
        } 
      ])
    return new WorkflowResponse(serviceInstance)
  }
)