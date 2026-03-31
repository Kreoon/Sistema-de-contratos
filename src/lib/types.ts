export interface ContractTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  content: string
  variables: TemplateVariable[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateVariable {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'email' | 'textarea' | 'select'
  required: boolean
  placeholder?: string
  options?: string[] // Para tipo select
}

export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'cancelled'

export interface Contract {
  id: string
  template_id: string
  title: string
  signer_name: string
  signer_email: string
  signer_document_id: string | null
  signer_company: string | null
  contract_data: Record<string, string>
  rendered_html: string | null
  status: ContractStatus
  signed_pdf_url: string | null
  signing_token: string
  token_expires_at: string | null
  sent_at: string | null
  viewed_at: string | null
  signed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  template?: ContractTemplate
}

export interface Signature {
  id: string
  contract_id: string
  signature_type: 'drawn' | 'typed'
  signature_image_url: string | null
  typed_name: string | null
  document_hash: string
  signature_hash: string
  ip_address: string
  user_agent: string
  geolocation: GeoLocation | null
  device_info: DeviceInfo | null
  consent_text: string
  consent_accepted_at: string
  created_at: string
}

export interface GeoLocation {
  lat: number
  lng: number
  country: string
  city: string
  region: string
}

export interface DeviceInfo {
  browser: string
  os: string
  device_type: string
  screen: string
}

export type AuditAction = 'created' | 'sent' | 'viewed' | 'signed' | 'downloaded' | 'email_sent'
export type ActorType = 'admin' | 'signer' | 'system'

export interface AuditEntry {
  id: string
  contract_id: string
  action: AuditAction
  actor_type: ActorType
  actor_email: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  document_hash: string | null
  created_at: string
}

export interface SigningPayload {
  contractId: string
  signatureType: 'drawn' | 'typed'
  signatureData: string // base64 image or typed name
  consentText: string
  consentAcceptedAt: string
  documentHash: string
  metadata: AuditMetadata
}

export interface AuditMetadata {
  ip_address: string
  user_agent: string
  geolocation: GeoLocation | null
  device_info: DeviceInfo
}

export type PersonType = 'natural' | 'juridica'
export type ContactCategory = 'lead' | 'prospecto' | 'cliente' | 'inactivo'

export interface Contact {
  id: string
  tipo_persona: PersonType
  nombre_completo: string | null
  tipo_documento: string | null
  numero_documento: string | null
  empresa: string | null
  id_fiscal: string | null
  sigla: string | null
  representante_legal: string | null
  tipo_documento_representante: string | null
  numero_documento_representante: string | null
  email: string | null
  telefono: string | null
  celular: string | null
  direccion: string | null
  ciudad: string | null
  departamento: string | null
  pais: string
  web_redes: string | null
  persona_encargada: string | null
  email_encargada: string | null
  celular_encargada: string | null
  categoria: ContactCategory
  etiquetas: string[]
  notas: string | null
  fuente: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // From view
  display_name?: string
  total_contratos?: number
  contratos_firmados?: number
  contratos_pendientes?: number
  ultimo_contrato?: string | null
}

export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido' | 'cancelado'

export interface PaymentInstallment {
  id: string
  contract_id: string
  numero_cuota: number
  descripcion: string | null
  monto: number
  moneda: string
  fecha_vencimiento: string
  estado: PaymentStatus
  fecha_pago: string | null
  metodo_pago: string | null
  comprobante_url: string | null
  notas: string | null
  recordatorio_enviado: boolean
  created_at: string
  updated_at: string
}
