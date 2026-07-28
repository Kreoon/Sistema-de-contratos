-- ================================================
-- Migration: Permitir IP nula en firmas
-- ================================================
-- Cuando el navegador del firmante bloquea la captura de IP (CORS, ad-blocker,
-- red sin acceso a servicios externos, etc.), el frontend envía NULL en vez de
-- un valor inválido. La columna era INET NOT NULL, lo cual no tiene sentido
-- cuando la IP simplemente no se pudo determinar.

ALTER TABLE signatures ALTER COLUMN ip_address DROP NOT NULL;
