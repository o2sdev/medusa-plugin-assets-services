import { AddressDTO, CustomerDTO, ProductDTO, ProductVariantDTO } from "@medusajs/framework/types"

export type AssetType = {
    id: string
    name: string
    thumbnail: string
    serial_number: string
    end_of_warranty_date: Date
    service_item_id: string
    created_at: Date
    updated_at: Date
    address: AddressDTO
    product_variant: ProductVariantDTO
    customer: CustomerDTO
    service_instances: ServiceInstanceType[]
    totals: Record<string, unknown>
}

export type AssetsResponseType = {
    assets: AssetType[]
    count: number
    offset: number
    limit: number
}

export type AssetResponseType = {
    asset: AssetType
}

export type ServiceInstanceType = {
    id: string
    name: string
    start_date: string
    end_date: string
    purchase_date: string
    payment_type: string
    status: string
    customer: CustomerDTO
    assets: AssetType[]
    totals: Record<string, unknown>
    product_variant: ProductVariantDTO
}

export type ServiceInstanceResponseType = {
    serviceInstance: ServiceInstanceType
}

export type ServiceInstancesResponseType = {
    serviceInstances: ServiceInstanceType[]
    count: number
    offset: number
    limit: number
}

export type ProductSearchResultType = {
    variants: ProductVariantDTO[]
    count: number
}

export type CustomerType = {
    id: string
    email: string
    first_name?: string
    last_name?: string
}

export type CustomerSearchResultType = {
    customers: CustomerType[]
    count: number
}

export type ProductReferenceType = {
    id: string
    source_product_variant_id: string
    target_product_variant_id: string
    reference_type: string
    targetProduct: {
      id: string
      title: string
      sku: string
      ean: string
      product: {
        id: string
        title: string
      }
    }
  }
  
export type ProductReferencesResponseType = {
    productReferences: ProductReferenceType[]
}

export type CompatibleService = ProductVariantDTO & {
    id: string
    title: string
    sku: string
    ean: string
    product_id: string
    product?: ProductDTO
    prices?: Array<{
        id: string
        currency_code: string
        amount: number
        [key: string]: any
    }>
}

export enum PaymentTypeEnum {
    ONE_TIME = "One time",
    WEEKLY = "Weekly",
    MONTHLY = "Monthly",
    YEARLY = "Yearly",
}

export enum ServiceInstanceStatusEnum {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    EXPIRED = "Expired",
}

export enum ProductReferenceTypeEnum {
    SPARE_PART = "Spare part",
    ACCESSORY = "Accessory",
    REPLACEMENT = "Replacement",
    TOOL = "Tool",
    COMPATIBLE_SERVICE = "Compatible service",
}
