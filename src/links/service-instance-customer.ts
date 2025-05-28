import { defineLink } from "@medusajs/framework/utils";
import CustomerModule from "@medusajs/medusa/customer";
import AssetsServicesModule from "../modules/assets-services";

export default defineLink(
    {
        linkable: AssetsServicesModule.linkable.serviceInstance,
        isList: true,
    },
    CustomerModule.linkable.customer
)
