CREATE TABLE "chat_burst" (
	"ventana" integer NOT NULL,
	"ip_hash" text NOT NULL,
	"mensajes" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "chat_burst_ventana_ip_hash_pk" PRIMARY KEY("ventana","ip_hash")
);
