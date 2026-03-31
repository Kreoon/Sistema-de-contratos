-- ================================================
-- Migration: Deduplicación de contactos + helpers
-- ================================================

-- Unique constraint: no duplicar por numero_documento (persona natural)
CREATE UNIQUE INDEX idx_contacts_unique_documento
  ON contacts(numero_documento)
  WHERE numero_documento IS NOT NULL AND numero_documento != '';

-- Unique constraint: no duplicar por id_fiscal (persona jurídica / NIT)
CREATE UNIQUE INDEX idx_contacts_unique_fiscal
  ON contacts(id_fiscal)
  WHERE id_fiscal IS NOT NULL AND id_fiscal != '';

-- Function: buscar o crear contacto (upsert por documento)
CREATE OR REPLACE FUNCTION upsert_contact(
  p_tipo_persona TEXT,
  p_nombre_completo TEXT DEFAULT NULL,
  p_tipo_documento TEXT DEFAULT NULL,
  p_numero_documento TEXT DEFAULT NULL,
  p_empresa TEXT DEFAULT NULL,
  p_id_fiscal TEXT DEFAULT NULL,
  p_sigla TEXT DEFAULT NULL,
  p_representante_legal TEXT DEFAULT NULL,
  p_tipo_documento_representante TEXT DEFAULT NULL,
  p_numero_documento_representante TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_telefono TEXT DEFAULT NULL,
  p_celular TEXT DEFAULT NULL,
  p_direccion TEXT DEFAULT NULL,
  p_ciudad TEXT DEFAULT NULL,
  p_departamento TEXT DEFAULT NULL,
  p_pais TEXT DEFAULT 'Colombia',
  p_web_redes TEXT DEFAULT NULL,
  p_persona_encargada TEXT DEFAULT NULL,
  p_email_encargada TEXT DEFAULT NULL,
  p_celular_encargada TEXT DEFAULT NULL,
  p_fuente TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_contact_id UUID;
BEGIN
  -- Buscar por documento (natural) o id_fiscal (jurídica)
  IF p_tipo_persona = 'natural' AND p_numero_documento IS NOT NULL AND p_numero_documento != '' THEN
    SELECT id INTO v_contact_id FROM contacts WHERE numero_documento = p_numero_documento LIMIT 1;
  ELSIF p_tipo_persona = 'juridica' AND p_id_fiscal IS NOT NULL AND p_id_fiscal != '' THEN
    SELECT id INTO v_contact_id FROM contacts WHERE id_fiscal = p_id_fiscal LIMIT 1;
  END IF;

  -- Si existe, actualizar datos de contacto (no sobreescribir categoría ni notas)
  IF v_contact_id IS NOT NULL THEN
    UPDATE contacts SET
      nombre_completo = COALESCE(p_nombre_completo, nombre_completo),
      email = COALESCE(p_email, email),
      telefono = COALESCE(p_telefono, telefono),
      celular = COALESCE(p_celular, celular),
      direccion = COALESCE(p_direccion, direccion),
      ciudad = COALESCE(p_ciudad, ciudad),
      departamento = COALESCE(p_departamento, departamento),
      pais = COALESCE(p_pais, pais),
      representante_legal = COALESCE(p_representante_legal, representante_legal),
      persona_encargada = COALESCE(p_persona_encargada, persona_encargada),
      email_encargada = COALESCE(p_email_encargada, email_encargada),
      celular_encargada = COALESCE(p_celular_encargada, celular_encargada),
      updated_at = now()
    WHERE id = v_contact_id;
    RETURN v_contact_id;
  END IF;

  -- Si no existe, crear nuevo
  INSERT INTO contacts (
    tipo_persona, nombre_completo, tipo_documento, numero_documento,
    empresa, id_fiscal, sigla, representante_legal,
    tipo_documento_representante, numero_documento_representante,
    email, telefono, celular, direccion, ciudad, departamento, pais,
    web_redes, persona_encargada, email_encargada, celular_encargada,
    categoria, fuente
  ) VALUES (
    p_tipo_persona, p_nombre_completo, p_tipo_documento, p_numero_documento,
    p_empresa, p_id_fiscal, p_sigla, p_representante_legal,
    p_tipo_documento_representante, p_numero_documento_representante,
    p_email, p_telefono, p_celular, p_direccion, p_ciudad, p_departamento, p_pais,
    p_web_redes, p_persona_encargada, p_email_encargada, p_celular_encargada,
    'cliente', p_fuente
  ) RETURNING id INTO v_contact_id;

  RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
