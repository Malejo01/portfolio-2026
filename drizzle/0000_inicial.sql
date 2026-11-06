CREATE TABLE "briefs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"nombre" text NOT NULL,
	"contacto" text NOT NULL,
	"rubro" text NOT NULL,
	"necesidad" text NOT NULL,
	"plan" text,
	"presupuesto" text,
	"consent_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"convertido" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_usage" (
	"dia" date NOT NULL,
	"ip_hash" text NOT NULL,
	"mensajes" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "chat_usage_dia_ip_hash_pk" PRIMARY KEY("dia","ip_hash")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"nombre" text NOT NULL,
	"whatsapp" text NOT NULL,
	"rubro" text NOT NULL,
	"resumen" text NOT NULL,
	"origen" text DEFAULT 'chat' NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"convertido" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX "briefs_created_at_idx" ON "briefs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");