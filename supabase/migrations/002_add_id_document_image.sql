-- ================================================
-- Migration: Add ID document image to signatures
-- ================================================

-- Add column for ID document photo
ALTER TABLE signatures ADD COLUMN id_document_image_url TEXT;

-- Update sign_contract function to accept ID document image
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
  p_consent_text TEXT,
  p_id_document_image_url TEXT DEFAULT NULL
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
    geolocation, device_info, consent_text, consent_accepted_at,
    id_document_image_url
  ) VALUES (
    v_contract_id, p_signature_type, p_signature_image_url, p_typed_name,
    p_document_hash, p_signature_hash, p_ip_address, p_user_agent,
    p_geolocation, p_device_info, p_consent_text, now(),
    p_id_document_image_url
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
      'device_info', p_device_info,
      'has_id_document', p_id_document_image_url IS NOT NULL
    )
  );

  RETURN v_signature_id;
END;
$$ LANGUAGE plpgsql;
