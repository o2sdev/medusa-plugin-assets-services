import { model } from "@medusajs/framework/utils";
import { Asset } from "./asset";

export const ServiceInstance = model.define("service_instance", {
  id: model.id().primaryKey(),
  name: model.text().searchable().nullable(),
  start_date: model.dateTime(),
  end_date: model.dateTime().nullable(),
  purchase_date: model.dateTime().nullable(),
  payment_type: model.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "YEARLY"]),
  status: model.enum(["ACTIVE", "INACTIVE", "EXPIRED"]),
  assets: model.manyToMany(() => Asset, { mappedBy: "service_instances" }),
  totals: model.json().nullable(),
})
