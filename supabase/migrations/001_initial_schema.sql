-- ================================================
-- Sistema de Contratos - Feria Effix
-- Migration: Initial Schema
-- ================================================

-- Templates de contrato
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contratos generados
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES contract_templates(id),
  title TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_document_id TEXT,
  signer_company TEXT,
  contract_data JSONB NOT NULL DEFAULT '{}',
  rendered_html TEXT,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','sent','viewed','signed','completed','cancelled')),
  signed_pdf_url TEXT,
  signing_token UUID DEFAULT gen_random_uuid(),
  token_expires_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contracts_status ON contracts(status);
CREATE UNIQUE INDEX idx_contracts_token ON contracts(signing_token);
CREATE INDEX idx_contracts_signer_email ON contracts(signer_email);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);

-- Firmas capturadas
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signature_type TEXT NOT NULL CHECK (signature_type IN ('drawn','typed')),
  signature_image_url TEXT,
  typed_name TEXT,
  document_hash TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  geolocation JSONB,
  device_info JSONB,
  consent_text TEXT NOT NULL,
  consent_accepted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_signatures_contract ON signatures(contract_id);

-- Audit trail inmutable
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin','signer','system')),
  actor_email TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  document_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_contract ON audit_trail(contract_id);
CREATE INDEX idx_audit_action ON audit_trail(action);
CREATE INDEX idx_audit_created ON audit_trail(created_at DESC);

-- ================================================
-- RLS Policies
-- ================================================

-- contract_templates: admin full access
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read templates"
  ON contract_templates FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert templates"
  ON contract_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update templates"
  ON contract_templates FOR UPDATE
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete templates"
  ON contract_templates FOR DELETE
  USING (auth.role() = 'authenticated');

-- contracts: admin full access
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read contracts"
  ON contracts FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update contracts"
  ON contracts FOR UPDATE
  USING (auth.role() = 'authenticated');

-- signatures: admin read only
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read signatures"
  ON signatures FOR SELECT
  USING (auth.role() = 'authenticated');

-- audit_trail: admin read only (inserts via service_role from Edge Functions)
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read audit trail"
  ON audit_trail FOR SELECT
  USING (auth.role() = 'authenticated');

-- ================================================
-- Functions
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to get contract by signing token (used by public signing page, bypasses RLS)
CREATE OR REPLACE FUNCTION get_contract_by_token(p_token UUID)
RETURNS TABLE (
  id UUID,
  template_id UUID,
  title TEXT,
  signer_name TEXT,
  signer_email TEXT,
  signer_document_id TEXT,
  signer_company TEXT,
  contract_data JSONB,
  rendered_html TEXT,
  status TEXT,
  signing_token UUID,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id, c.template_id, c.title, c.signer_name, c.signer_email,
    c.signer_document_id, c.signer_company, c.contract_data,
    c.rendered_html, c.status, c.signing_token, c.token_expires_at,
    c.created_at
  FROM contracts c
  WHERE c.signing_token = p_token
    AND c.status IN ('sent', 'viewed')
    AND (c.token_expires_at IS NULL OR c.token_expires_at > now());
END;
$$ LANGUAGE plpgsql;

-- Function to sign contract (used by public signing page, bypasses RLS)
CREATE OR REPLACE FUNCTION sign_contract(
  p_token UUID,
  p_signature_type TEXT,
  p_signature_image_url TEXT,
  p_typed_name TEXT,
  p_document_hash TEXT,
  p_signature_hash TEXT,
  p_ip_address INET,
  p_user_agent TEXT,
  p_geolocation JSONB,
  p_device_info JSONB,
  p_consent_text TEXT
)
RETURNS UUID SECURITY DEFINER AS $$
DECLARE
  v_contract_id UUID;
  v_signature_id UUID;
  v_signer_email TEXT;
BEGIN
  -- Get and validate contract
  SELECT c.id, c.signer_email INTO v_contract_id, v_signer_email
  FROM contracts c
  WHERE c.signing_token = p_token
    AND c.status IN ('sent', 'viewed')
    AND (c.token_expires_at IS NULL OR c.token_expires_at > now());

  IF v_contract_id IS NULL THEN
    RAISE EXCEPTION 'Contrato no encontrado o ya firmado';
  END IF;

  -- Create signature record
  INSERT INTO signatures (
    contract_id, signature_type, signature_image_url, typed_name,
    document_hash, signature_hash, ip_address, user_agent,
    geolocation, device_info, consent_text, consent_accepted_at
  ) VALUES (
    v_contract_id, p_signature_type, p_signature_image_url, p_typed_name,
    p_document_hash, p_signature_hash, p_ip_address, p_user_agent,
    p_geolocation, p_device_info, p_consent_text, now()
  ) RETURNING id INTO v_signature_id;

  -- Update contract status
  UPDATE contracts SET
    status = 'signed',
    signed_at = now()
  WHERE id = v_contract_id;

  -- Add audit trail entry
  INSERT INTO audit_trail (
    contract_id, action, actor_type, actor_email,
    ip_address, user_agent, document_hash, metadata
  ) VALUES (
    v_contract_id, 'signed', 'signer', v_signer_email,
    p_ip_address, p_user_agent, p_document_hash,
    jsonb_build_object(
      'signature_id', v_signature_id,
      'signature_type', p_signature_type,
      'geolocation', p_geolocation,
      'device_info', p_device_info
    )
  );

  RETURN v_signature_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark contract as viewed (used by public signing page)
CREATE OR REPLACE FUNCTION mark_contract_viewed(
  p_token UUID,
  p_ip_address INET,
  p_user_agent TEXT
)
RETURNS VOID SECURITY DEFINER AS $$
DECLARE
  v_contract_id UUID;
  v_signer_email TEXT;
BEGIN
  SELECT c.id, c.signer_email INTO v_contract_id, v_signer_email
  FROM contracts c
  WHERE c.signing_token = p_token AND c.status = 'sent';

  IF v_contract_id IS NOT NULL THEN
    UPDATE contracts SET status = 'viewed', viewed_at = now()
    WHERE id = v_contract_id;

    INSERT INTO audit_trail (contract_id, action, actor_type, actor_email, ip_address, user_agent)
    VALUES (v_contract_id, 'viewed', 'signer', v_signer_email, p_ip_address, p_user_agent);
  END IF;
END;
$$ LANGUAGE plpgsql;
