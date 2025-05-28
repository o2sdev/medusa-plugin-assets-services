import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ASSETS_SERVICES_MODULE } from "../modules/assets-services"
import AssetsServicesModuleService from "../modules/assets-services/service"
import { Modules } from "@medusajs/framework/utils"
import { createRemoteLinkStep } from "@medusajs/core-flows"
import { CreateAddressDTO } from "@medusajs/framework/types"

type CreateAsseWorkflowtInput = {
    name: string
    thumbnail?: string
    serial_number: string
    end_of_warranty_date?: Date
    address: CreateAddressDTO
    service_instances?: string[]
    totals?: Record<string, unknown>
}

const createAssetStep = createStep(
    "create-asset",
    async (input: CreateAsseWorkflowtInput, { container }) => {
        const assetsServicesModuleService: AssetsServicesModuleService = container.resolve(ASSETS_SERVICES_MODULE)
        const cartModuleService = container.resolve(Modules.CART)

        const address = await cartModuleService.createAddresses(input.address)
        const asset = await assetsServicesModuleService.createAssets(input)
        return new StepResponse({asset, address}, {asset, address})
    },
    async (result, { container }) => {
        const assetsServicesModuleService: AssetsServicesModuleService = container.resolve(ASSETS_SERVICES_MODULE)
        const cartModuleService = container.resolve(Modules.CART)
        if (result?.asset) {
            await assetsServicesModuleService.deleteAssets(result.asset.id)
        }
        if (result?.address) {
            await cartModuleService.deleteAddresses(result.address.id)
        }
    }
)

export const createAssetWorkflow = createWorkflow(
    "create-asset",
    (input: { assetData: CreateAsseWorkflowtInput, variantId: string, customerId?: string, currency_code: string }) => {

        const result = createAssetStep({...input.assetData})

        // Create a base array with the required links
        const links = [
            {
                [ASSETS_SERVICES_MODULE]: { asset_id: result.asset.id },
                [Modules.PRODUCT]: { product_variant_id: input.variantId }
            },
            {
                [ASSETS_SERVICES_MODULE]: { asset_id: result.asset.id },
                [Modules.CART]: { address_id: result.address.id }
            }
        ]

        // Only add the customer link if customerId exists
        if (input.customerId !== undefined) {
            links.push({
                [ASSETS_SERVICES_MODULE]: { asset_id: result.asset.id },
                [Modules.CUSTOMER]: { customer_id: input.customerId }
            } as any)
        }

        createRemoteLinkStep(links as any)

        return new WorkflowResponse(result.asset)
    }
)
