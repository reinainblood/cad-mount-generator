import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  amazonUrl: text("amazon_url").notNull(),
  dimensions: jsonb("dimensions").notNull(),
  metadata: jsonb("metadata").notNull(),
  productType: text("product_type").notNull(), // e.g., 'compute_module', 'accessory'
  compatibleWith: jsonb("compatible_with").default('[]'), // Array of compatible product types
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mounts = pgTable("mounts", {
  id: serial("id").primaryKey(),
  productId: serial("product_id").references(() => products.id),
  requirements: jsonb("requirements").notNull(),
  scadCode: text("scad_code").notNull(),
  mountType: text("mount_type").notNull(), // e.g., 'case', 'wall_mount', 'rack_mount'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertMountSchema = createInsertSchema(mounts);
export const selectMountSchema = createSelectSchema(mounts);

export type Product = typeof products.$inferSelect;
export type Mount = typeof mounts.$inferSelect;