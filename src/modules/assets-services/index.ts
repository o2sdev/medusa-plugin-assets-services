import { Module } from "@medusajs/framework/utils";
import AssetsServicesModuleService from "./service";

export const ASSETS_SERVICES_MODULE = "assetsServicesModuleService";

export default Module(ASSETS_SERVICES_MODULE, {
    service: AssetsServicesModuleService,
});