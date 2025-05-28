import CartModule from "@medusajs/medusa/cart";
import AssetsServicesModule from "../modules/assets-services";
import { defineLink } from "@medusajs/framework/utils";

export default defineLink(
    AssetsServicesModule.linkable.asset,
    CartModule.linkable.address,
)