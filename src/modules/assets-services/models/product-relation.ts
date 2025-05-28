import { model } from "@medusajs/framework/utils"

export const SourceProductVariant = model.define("source_product_variant", {
  id: model.id().primaryKey(),
  references: model.manyToMany(() => TargetProductVariant, {
    pivotEntity: () => ProductVariantReference,
  }),
})

export const TargetProductVariant = model.define("target_product_variant", {
  id: model.id().primaryKey(),
  reference_to: model.manyToMany(() => SourceProductVariant, {
    mappedBy: "references",
  }),
})

export const ProductVariantReference = model.define("product_variant_reference", {
  id: model.id().primaryKey(),
  source_product_variant: model.belongsTo(() => SourceProductVariant, {
    mappedBy: "references",
  }),
  target_product_variant: model.belongsTo(() => TargetProductVariant, {
    mappedBy: "reference_to",
  }),
  metadata: model.json().nullable(),
  reference_type: model.enum(["SPARE_PART", "ACCESSORY", "REPLACEMENT", "TOOL", "COMPATIBLE_SERVICE"])
}).indexes([
  {
    on: ["source_product_variant_id", "target_product_variant_id", "reference_type"],
    unique: true,
  },
])