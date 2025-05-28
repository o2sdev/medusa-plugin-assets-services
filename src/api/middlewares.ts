import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { PatchAdminUpdateAsset, PostAdminCreateAsset, PostAdminTransferAssetOwnership } from "./admin/assets/validators";
import { PatchAdminUpdateServiceInstance, PostAdminCreateServiceInstance, PostAdminTransferServiceInstanceOwnership } from "./admin/service-instances/validators";
import { PostAdminCreateProductReference } from "./admin/products/validators";

export default defineMiddlewares({
    routes: [
        {
            matcher: "/admin/assets/:id",
            method: "PATCH",
            middlewares: [
                validateAndTransformBody(PatchAdminUpdateAsset),
            ],
        },
        {
            matcher: "/admin/service-instances/:id",
            method: "PATCH",
            middlewares: [
                validateAndTransformBody(PatchAdminUpdateServiceInstance)
            ],
        },
        {
            matcher: "/admin/service-instances",
            method: "POST",
            middlewares: [
                validateAndTransformBody(PostAdminCreateServiceInstance)
            ],
        },
        {
            matcher: "/admin/assets",
            method: "POST",
            middlewares: [
                validateAndTransformBody(PostAdminCreateAsset)
            ],
        },
        {
            matcher: "/admin/assets/:id/transfer-ownership",
            method: "POST",
            middlewares: [
                validateAndTransformBody(PostAdminTransferAssetOwnership)
            ],
        },
        {
            matcher: "/admin/service-instances/:id/transfer-ownership",
            method: "POST",
            middlewares: [
                validateAndTransformBody(PostAdminTransferServiceInstanceOwnership)
            ],
        },
        {
            matcher: "/admin/products/:id/variants/:variantId/references",
            method: "POST",
            middlewares: [
                validateAndTransformBody(PostAdminCreateProductReference)
            ],
        }
    ]
})