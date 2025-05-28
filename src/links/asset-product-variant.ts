import { defineLink } from "@medusajs/framework/utils";
import AssetsServicesModule from "../modules/assets-services";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
    {
        linkable: AssetsServicesModule.linkable.asset,
        isList: true,
    },
    ProductModule.linkable.productVariant,
)