import { MedusaService } from "@medusajs/framework/utils"
import { ProductVariantReference, SourceProductVariant, TargetProductVariant } from "./models/product-relation";
import { ServiceInstance } from "./models/service-instance";
import { Asset } from "./models/asset";

class AssetsServicesModuleService extends MedusaService({
    SourceProductVariant,
    TargetProductVariant,
    ProductVariantReference,
    ServiceInstance,
    Asset
}) {
    constructor() {
        super(...arguments)
    }
}

export default AssetsServicesModuleService;