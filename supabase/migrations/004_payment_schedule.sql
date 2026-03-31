-- ================================================
-- Migration: Cronograma de pagos / cuotas
-- ================================================

CREATE TABLE payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  numero_cuota INT NOT NULL,
  descripcion TEXT,                          -- "Anticipo", "Cuota 2", "Saldo final"
  monto DECIMAL(15,2) NOT NULL,
  moneda TEXT DEFAULT 'COP',
  fecha_vencimiento DATE NOT NULL,
  estado TEXT DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'cancelado')),
  fecha_pago DATE,                           -- Fecha real de pago
  metodo_pago TEXT,                          -- "Transferencia", "Efectivo", etc.
  comprobante_url TEXT,                      -- URL del soporte de pago
  notas TEXT,
  recordatorio_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_installments_contract ON payment_installments(contract_id);
CREATE INDEX idx_installments_estado ON payment_installments(estado);
CREATE INDEX idx_installments_vencimiento ON payment_installments(fecha_vencimiento);

CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON payment_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users read installments" ON payment_installments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users insert installments" ON payment_installments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth users update installments" ON payment_installments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users delete installments" ON payment_installments FOR DELETE USING (auth.role() = 'authenticated');
