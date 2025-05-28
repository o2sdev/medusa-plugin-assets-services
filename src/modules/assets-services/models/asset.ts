import { model } from "@medusajs/framework/utils";
import { ServiceInstance } from "./service-instance";

export const Asset = model.define("asset", {
  id: model.id().primaryKey(),
  name: model.text().searchable().nullable(),
  thumbnail: model.text().nullable(),
  serial_number: model.text().searchable().unique(),
  end_of_warranty_date: model.dateTime().nullable(),
  service_instances: model.manyToMany(() => ServiceInstance, { mappedBy: "assets" }),
  totals: model.json().nullable(),
});
