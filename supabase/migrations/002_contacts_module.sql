-- ================================================
-- Migration: Contacts/CRM Module
-- ================================================

-- Contactos (personas y empresas)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tipo
  tipo_persona TEXT NOT NULL CHECK (tipo_persona IN ('natural', 'juridica')),

  -- Persona Natural
  nombre_completo TEXT,
  tipo_documento TEXT,
  numero_documento TEXT,

  -- Persona Jurídica
  empresa TEXT,
  id_fiscal TEXT,
  sigla TEXT,
  representante_legal TEXT,
  tipo_documento_representante TEXT,
  numero_documento_representante TEXT,

  -- Contacto
  email TEXT,
  telefono TEXT,
  celular TEXT,
  direccion TEXT,
  ciudad TEXT,
  departamento TEXT,
  pais TEXT DEFAULT 'Colombia',
  web_redes TEXT,

  -- Persona encargada (para empresas, el contacto directo)
  persona_encargada TEXT,
  email_encargada TEXT,
  celular_encargada TEXT,

  -- CRM fields
  categoria TEXT DEFAULT 'lead' CHECK (categoria IN ('lead', 'prospecto', 'cliente', 'inactivo')),
  etiquetas TEXT[] DEFAULT '{}',
  notas TEXT,
  fuente TEXT, -- "feria_effix_2026", "referido", "web", etc.

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_tipo ON contacts(tipo_persona);
CREATE INDEX idx_contacts_categoria ON contacts(categoria);
CREATE INDEX idx_contacts_pais ON contacts(pais);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_empresa ON contacts(empresa);
CREATE INDEX idx_contacts_nombre ON contacts(nombre_completo);

-- Trigger updated_at
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add contact_id to contracts table
ALTER TABLE contracts ADD COLUMN contact_id UUID REFERENCES contacts(id);
CREATE INDEX idx_contracts_contact ON contracts(contact_id);

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read contacts" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert contacts" ON contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update contacts" ON contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete contacts" ON contacts FOR DELETE USING (auth.role() = 'authenticated');

-- Computed display name view
CREATE OR REPLACE VIEW contacts_with_stats AS
SELECT
  c.*,
  CASE
    WHEN c.tipo_persona = 'natural' THEN c.nombre_completo
    ELSE COALESCE(c.empresa, c.representante_legal)
  END as display_name,
  COUNT(ct.id) as total_contratos,
  COUNT(ct.id) FILTER (WHERE ct.status = 'signed' OR ct.status = 'completed') as contratos_firmados,
  COUNT(ct.id) FILTER (WHERE ct.status = 'sent' OR ct.status = 'viewed') as contratos_pendientes,
  MAX(ct.created_at) as ultimo_contrato
FROM contacts c
LEFT JOIN contracts ct ON ct.contact_id = c.id
GROUP BY c.id;
