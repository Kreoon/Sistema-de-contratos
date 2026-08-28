-- El firmante navega de forma anónima y las políticas RLS de contratos.contracts
-- y contratos.signatures solo permiten leer a usuarios autenticados. Por eso la
-- pantalla final de firma quedaba vacía: sin título, sin certificado y sin botón
-- para descargar el PDF. get_contract_by_token no sirve aquí porque no expone
-- signed_pdf_url ni los datos de la firma.
--
-- Esta función replica el patrón de get_contract_by_token: SECURITY DEFINER con
-- acceso limitado a quien conozca el token de firma (un UUID aleatorio).

create or replace function contratos.get_signed_contract_by_token(p_token uuid)
returns table (
  id uuid,
  title text,
  status text,
  signed_pdf_url text,
  signature_type text,
  consent_accepted_at timestamptz,
  ip_address text,
  device_info jsonb,
  document_hash text,
  signature_hash text,
  consent_text text
)
language sql
stable
security definer
set search_path = contratos, public
as $$
  select
    c.id,
    c.title,
    c.status,
    c.signed_pdf_url,
    s.signature_type,
    s.consent_accepted_at,
    host(s.ip_address)::text as ip_address,
    s.device_info,
    s.document_hash,
    s.signature_hash,
    s.consent_text
  from contratos.contracts c
  left join lateral (
    select sg.*
    from contratos.signatures sg
    where sg.contract_id = c.id
    order by sg.created_at desc
    limit 1
  ) s on true
  where c.signing_token = p_token;
$$;

grant execute on function contratos.get_signed_contract_by_token(uuid) to anon, authenticated;
