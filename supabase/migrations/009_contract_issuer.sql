-- La empresa opera con dos razones sociales (EFFIX S.A.S. y FERIA EFFIX S.A.S.)
-- y al crear un contrato se elige con cuál se emite. El catálogo de empresas
-- vive en el código (src/lib/organizer.ts, ISSUERS); aquí solo se guarda el
-- slug elegido para poder filtrar y mostrarlo. Los datos completos de la
-- empresa (org_*) siguen congelándose en contract_data y rendered_html.
--
-- Ejecutar en: https://supabase.com/dashboard/project/hidkhplgahoiusfxfrzi/sql/new

-- 1. Empresa emisora por contrato. Los contratos existentes se emitieron
--    todos con EFFIX S.A.S., que es el valor por defecto.
alter table contratos.contracts
  add column if not exists issuer_id text not null default 'effix';

comment on column contratos.contracts.issuer_id is
  'Slug de la empresa emisora; catálogo en src/lib/organizer.ts (ISSUERS)';

create index if not exists idx_contracts_issuer
  on contratos.contracts (issuer_id);

-- 2. Las plantillas de Stand y Patrocinio tenían la razón social escrita a
--    mano en vez de la variable {{org_empresa}}, así que ignorarían la empresa
--    elegida. Se limita a esas dos plantillas: la de TyC de financiación de
--    boletería menciona a EFFIX S.A.S. como titular de la cuenta bancaria y con
--    su NIT literal, y ahí la razón social no debe cambiar con la emisora.
update contratos.contract_templates
   set content = replace(
         content,
         '<strong>EFFIX S.A.S.</strong>, identificada con NIT {{org_nit}}',
         '<strong>{{org_empresa}}</strong>, identificada con NIT {{org_nit}}'
       ),
       updated_at = now()
 where slug in ('stand-effix', 'patrocinio-effix')
   and content like '%<strong>EFFIX S.A.S.</strong>, identificada con NIT {{org_nit}}%';
