import { boolean, date, index, integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Esquema de la base de la agencia (Neon). Solo datos que el visitante dio
 * con consentimiento explícito: no hay transcripciones de chat, y no existe
 * ninguna herramienta del agente que lea estas tablas.
 *
 * Migraciones: `npm run db:generate` (commiteadas en `drizzle/`) y
 * `npm run db:migrate` (las aplica Mauro con `DATABASE_URL`).
 */

/** Contactos que dejó el chat de Malejo, con la casilla marcada. */
export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    nombre: text("nombre").notNull(),
    whatsapp: text("whatsapp").notNull(),
    rubro: text("rubro").notNull(),
    resumen: text("resumen").notNull(),
    /** "chat" hoy; queda abierto para otros orígenes. */
    origen: text("origen").notNull().default("chat"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    ipHash: text("ip_hash"),
    /** Lo marca Mauro a mano cuando el lead contrata: el cron no lo borra. */
    convertido: boolean("convertido").notNull().default(false),
  },
  (t) => [index("leads_created_at_idx").on(t.createdAt)],
);

/** Briefs del formulario de `/demo` (F5). */
export const briefs = pgTable(
  "briefs",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    nombre: text("nombre").notNull(),
    contacto: text("contacto").notNull(),
    rubro: text("rubro").notNull(),
    necesidad: text("necesidad").notNull(),
    plan: text("plan"),
    presupuesto: text("presupuesto"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    ipHash: text("ip_hash"),
    convertido: boolean("convertido").notNull().default(false),
  },
  (t) => [index("briefs_created_at_idx").on(t.createdAt)],
);

/** Contador de mensajes del chat por día e IP (hasheada), para los topes. */
export const chatUsage = pgTable(
  "chat_usage",
  {
    dia: date("dia").notNull(),
    ipHash: text("ip_hash").notNull(),
    mensajes: integer("mensajes").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.dia, t.ipHash] })],
);
