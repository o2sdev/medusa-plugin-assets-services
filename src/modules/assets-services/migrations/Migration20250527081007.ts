import { Migration } from '@mikro-orm/migrations';

export class Migration20250527081007 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "asset" ("id" text not null, "name" text null, "thumbnail" text null, "serial_number" text not null, "end_of_warranty_date" timestamptz null, "totals" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "asset_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_asset_serial_number_unique" ON "asset" (serial_number) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_asset_deleted_at" ON "asset" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "service_instance" ("id" text not null, "name" text null, "start_date" timestamptz not null, "end_date" timestamptz null, "purchase_date" timestamptz null, "payment_type" text check ("payment_type" in ('ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY')) not null, "status" text check ("status" in ('ACTIVE', 'INACTIVE', 'EXPIRED')) not null, "totals" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "service_instance_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_service_instance_deleted_at" ON "service_instance" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "asset_service_instances" ("asset_id" text not null, "service_instance_id" text not null, constraint "asset_service_instances_pkey" primary key ("asset_id", "service_instance_id"));`);

    this.addSql(`create table if not exists "source_product_variant" ("id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "source_product_variant_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_source_product_variant_deleted_at" ON "source_product_variant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "target_product_variant" ("id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "target_product_variant_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_target_product_variant_deleted_at" ON "target_product_variant" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "product_variant_reference" ("id" text not null, "source_product_variant_id" text not null, "target_product_variant_id" text not null, "metadata" jsonb null, "reference_type" text check ("reference_type" in ('SPARE_PART', 'ACCESSORY', 'REPLACEMENT', 'TOOL', 'COMPATIBLE_SERVICE')) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_variant_reference_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_reference_source_product_variant_id" ON "product_variant_reference" (source_product_variant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_reference_target_product_variant_id" ON "product_variant_reference" (target_product_variant_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_variant_reference_deleted_at" ON "product_variant_reference" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_variant_reference_source_product_variant_id_target_product_variant_id_reference_type_unique" ON "product_variant_reference" (source_product_variant_id, target_product_variant_id, reference_type) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "asset_service_instances" add constraint "asset_service_instances_asset_id_foreign" foreign key ("asset_id") references "asset" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table if exists "asset_service_instances" add constraint "asset_service_instances_service_instance_id_foreign" foreign key ("service_instance_id") references "service_instance" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "asset_service_instances" drop constraint if exists "asset_service_instances_asset_id_foreign";`);

    this.addSql(`alter table if exists "asset_service_instances" drop constraint if exists "asset_service_instances_service_instance_id_foreign";`);

    this.addSql(`drop table if exists "asset" cascade;`);

    this.addSql(`drop table if exists "service_instance" cascade;`);

    this.addSql(`drop table if exists "asset_service_instances" cascade;`);

    this.addSql(`drop table if exists "source_product_variant" cascade;`);

    this.addSql(`drop table if exists "target_product_variant" cascade;`);

    this.addSql(`drop table if exists "product_variant_reference" cascade;`);
  }

}
