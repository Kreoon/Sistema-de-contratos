import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, UserPlus, UserCheck, X, Plus, Trash2 } from 'lucide-react'
import { useTemplates } from '@/hooks/useTemplates'
import { supabase } from '@/lib/supabase'
import { renderTemplate } from '@/lib/template-engine'
import { ORGANIZER } from '@/lib/organizer'
import { COUNTRIES } from '@/lib/countries'
import { getDepartments, getCities, hasLocationData } from '@/lib/locations'
import { moneyToWords } from '@/lib/number-to-words'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ContractTemplate, TemplateVariable, Contact } from '@/lib/types'

export function ContractNew() {
  const { templates, loading: loadingTemplates } = useTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerDocId, setSignerDocId] = useState('')
  const [signerCompany, setSignerCompany] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const navigate = useNavigate()

  // --- Cuotas de pago ---
  interface Cuota {
    descripcion: string
    monto: string
    fecha: string
  }
  const [numCuotas, setNumCuotas] = useState(0)
  const [cuotas, setCuotas] = useState<Cuota[]>([])

  const handleNumCuotasChange = (n: number) => {
    setNumCuotas(n)
    const newCuotas: Cuota[] = []
    for (let i = 0; i < n; i++) {
      newCuotas.push(cuotas[i] || { descripcion: i === 0 ? 'Anticipo' : i === n - 1 ? 'Saldo final' : `Cuota ${i + 1}`, monto: '', fecha: '' })
    }
    setCuotas(newCuotas)
  }

  const updateCuota = (index: number, field: keyof Cuota, value: string) => {
    setCuotas(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // --- Contact selector state ---
  const [contactSearch, setContactSearch] = useState('')
  const [contactResults, setContactResults] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchingContacts, setSearchingContacts] = useState(false)
  const [showContactSearch, setShowContactSearch] = useState(false)

  // Buscar contactos existentes
  const searchContacts = useCallback(async (query: string) => {
    if (query.length < 2) { setContactResults([]); return }
    setSearchingContacts(true)
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .or(`nombre_completo.ilike.%${query}%,empresa.ilike.%${query}%,email.ilike.%${query}%,numero_documento.ilike.%${query}%,id_fiscal.ilike.%${query}%,representante_legal.ilike.%${query}%`)
      .limit(8)
    setContactResults((data || []) as Contact[])
    setSearchingContacts(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => { if (contactSearch) searchContacts(contactSearch) }, 300)
    return () => clearTimeout(timer)
  }, [contactSearch, searchContacts])

  // Cuando selecciona un contacto existente, rellenar el formulario
  const selectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setShowContactSearch(false)
    setContactSearch('')

    const newData: Record<string, string> = { ...formData }

    if (contact.tipo_persona === 'natural') {
      newData.tipo_persona = 'Persona Natural'
      if (contact.nombre_completo) newData.nombre_completo = contact.nombre_completo
      if (contact.tipo_documento) newData.tipo_documento = contact.tipo_documento
      if (contact.numero_documento) newData.numero_documento = contact.numero_documento
    } else {
      newData.tipo_persona = 'Persona Jurídica'
      if (contact.empresa) newData.empresa = contact.empresa
      if (contact.id_fiscal) newData.id_fiscal = contact.id_fiscal
      if (contact.sigla) newData.sigla = contact.sigla
      if (contact.representante_legal) newData.representante_legal = contact.representante_legal
      if (contact.tipo_documento_representante) newData.tipo_documento_representante = contact.tipo_documento_representante
      if (contact.numero_documento_representante) newData.numero_documento_representante = contact.numero_documento_representante
    }

    if (contact.email) { newData.email = contact.email; newData.email_contratista = contact.email }
    if (contact.telefono) newData.telefono = contact.telefono
    if (contact.celular) newData.celular = contact.celular
    if (contact.direccion) newData.direccion = contact.direccion
    if (contact.ciudad) newData.ciudad = contact.ciudad
    if (contact.departamento) newData.departamento = contact.departamento
    if (contact.pais) newData.pais = contact.pais
    if (contact.web_redes) newData.web_redes = contact.web_redes
    if (contact.persona_encargada) newData.persona_encargada = contact.persona_encargada
    if (contact.email_encargada) newData.email_encargada = contact.email_encargada
    if (contact.celular_encargada) newData.celular_encargada = contact.celular_encargada

    setFormData(newData)
  }

  const clearContact = () => {
    setSelectedContact(null)
    setFormData(prev => {
      const cleaned = { ...prev }
      // Keep only template-specific fields (not contact fields)
      const contactKeys = ['tipo_persona', 'nombre_completo', 'tipo_documento', 'numero_documento', 'empresa', 'id_fiscal', 'sigla', 'representante_legal', 'tipo_documento_representante', 'numero_documento_representante', 'email', 'email_contratista', 'telefono', 'celular', 'direccion', 'ciudad', 'departamento', 'pais', 'web_redes', 'persona_encargada', 'email_encargada', 'celular_encargada']
      contactKeys.forEach(k => delete cleaned[k])
      return cleaned
    })
  }

  // Auto-extraer datos del firmante desde las variables del contrato
  useEffect(() => {
    if (formData.tipo_persona === 'Persona Natural') {
      if (formData.nombre_completo) setSignerName(formData.nombre_completo)
      if (formData.numero_documento) setSignerDocId(formData.numero_documento)
      setSignerCompany('')
    } else if (formData.tipo_persona === 'Persona Jurídica') {
      if (formData.representante_legal) setSignerName(formData.representante_legal)
      if (formData.empresa) setSignerCompany(formData.empresa)
      if (formData.id_fiscal) setSignerDocId(formData.id_fiscal)
    }
    const emailKey = formData.email || formData.email_contratista || ''
    if (emailKey) setSignerEmail(emailKey)
  }, [formData])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    if (!selectedContact) setFormData({})
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Generar texto de forma de pago desde cuotas
  const formaPagoFromCuotas = cuotas.length > 0
    ? cuotas.map((c, i) => {
        const moneda = formData.moneda || 'COP'
        const monto = c.monto ? new Intl.NumberFormat('es-CO').format(Number(c.monto)) : '___'
        const fecha = c.fecha ? new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-CO') : '___'
        return `${c.descripcion || `Cuota ${i + 1}`}: ${moneda} $${monto} - Fecha límite: ${fecha}`
      }).join('. ')
    : ''

  const templateData: Record<string, unknown> = {
    org_nombre: ORGANIZER.nombre,
    org_documento_tipo: ORGANIZER.documento_tipo,
    org_documento: ORGANIZER.documento,
    org_empresa: ORGANIZER.empresa,
    org_nit: ORGANIZER.nit,
    org_direccion: ORGANIZER.direccion,
    org_ciudad: ORGANIZER.ciudad,
    org_departamento: ORGANIZER.departamento,
    org_pais: ORGANIZER.pais,
    org_email: ORGANIZER.email,
    org_telefono: ORGANIZER.telefono,
    org_lugar_evento: ORGANIZER.lugar_evento,
    ...formData,
    // Inyectar forma de pago generada desde cuotas
    ...(formaPagoFromCuotas ? { forma_pago: formaPagoFromCuotas } : {}),
    // Valor abono = primera cuota (si hay cuotas)
    ...(cuotas.length > 0 && cuotas[0].monto ? { valor_abono: cuotas[0].monto } : {}),
    // Sincronizar valor_total con honorarios/valor_patrocinio para templates
    ...(formData.valor_total ? {
      honorarios: formData.valor_total,
      valor_stand: formData.valor_total,
      valor_patrocinio: formData.valor_total,
    } : {}),
    // Auto-generar valor en letras
    ...(() => {
      const val = formData.valor_total || formData.honorarios || ''
      const letras = val ? moneyToWords(val, formData.moneda || 'COP') : ''
      return letras ? {
        honorarios_letras: letras,
        valor_stand_letras: letras,
        valor_patrocinio_letras: letras,
      } : {}
    })(),
    // Pasar cuotas como array para templates que lo usen
    cuotas: cuotas.filter(c => c.monto && c.fecha),
  }
  const renderedHtml = selectedTemplate ? renderTemplate(selectedTemplate.content, templateData as Record<string, string>) : ''

  // Campos que se gestionan en secciones especiales, no en "Datos del Contrato"
  const paymentKeys = ['valor_total', 'valor_abono', 'moneda', 'forma_pago', 'honorarios', 'honorarios_letras', 'valor_stand', 'valor_stand_letras', 'valor_patrocinio', 'valor_patrocinio_letras']
  const standKeys = ['tamano_stand']

  const visibleVariables = selectedTemplate?.variables.filter(v => {
    // Ocultar campos gestionados en secciones especiales
    if (paymentKeys.includes(v.key)) return false
    if (standKeys.includes(v.key)) return false
    const persona = formData.tipo_persona
    const naturalOnly = ['nombre_completo', 'tipo_documento', 'numero_documento']
    const juridicaOnly = ['empresa', 'id_fiscal', 'sigla', 'representante_legal', 'tipo_documento_representante', 'numero_documento_representante']
    if (!persona) return true
    if (naturalOnly.includes(v.key) && persona === 'Persona Jurídica') return false
    if (juridicaOnly.includes(v.key) && persona === 'Persona Natural') return false
    return true
  }) ?? []

  const handleSave = async (andSend: boolean) => {
    if (!selectedTemplate) return

    const missing = visibleVariables
      .filter(v => v.required && !formData[v.key])
      .map(v => v.label)
    if (missing.length > 0) {
      toast.error('Campos requeridos faltantes', { description: missing.join(', ') })
      return
    }

    setSaving(true)

    // 1. Upsert contacto en CRM (buscar o crear por documento)
    let contactId = selectedContact?.id || null

    if (!contactId) {
      const tipoPersona = formData.tipo_persona === 'Persona Jurídica' ? 'juridica' : 'natural'
      const { data: contactIdResult, error: contactError } = await supabase.rpc('upsert_contact', {
        p_tipo_persona: tipoPersona,
        p_nombre_completo: formData.nombre_completo || null,
        p_tipo_documento: formData.tipo_documento || null,
        p_numero_documento: formData.numero_documento || null,
        p_empresa: formData.empresa || null,
        p_id_fiscal: formData.id_fiscal || null,
        p_sigla: formData.sigla || null,
        p_representante_legal: formData.representante_legal || null,
        p_tipo_documento_representante: formData.tipo_documento_representante || null,
        p_numero_documento_representante: formData.numero_documento_representante || null,
        p_email: formData.email || formData.email_contratista || null,
        p_telefono: formData.telefono || null,
        p_celular: formData.celular || null,
        p_direccion: formData.direccion || null,
        p_ciudad: formData.ciudad || null,
        p_departamento: formData.departamento || null,
        p_pais: formData.pais || 'Colombia',
        p_web_redes: formData.web_redes || null,
        p_persona_encargada: formData.persona_encargada || null,
        p_email_encargada: formData.email_encargada || null,
        p_celular_encargada: formData.celular_encargada || null,
        p_fuente: 'feria_effix_2026',
      })

      if (contactError) {
        console.warn('Error creando contacto:', contactError.message)
      } else {
        contactId = contactIdResult
      }
    }

    // 2. Crear contrato vinculado al contacto
    const title = `${selectedTemplate.name} - ${signerName}`
    const tokenExpires = new Date()
    tokenExpires.setDate(tokenExpires.getDate() + 30)

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        template_id: selectedTemplate.id,
        contact_id: contactId,
        title,
        signer_name: signerName,
        signer_email: signerEmail,
        signer_document_id: signerDocId || null,
        signer_company: signerCompany || null,
        contract_data: { ...templateData },
        rendered_html: renderedHtml,
        status: andSend ? 'sent' : 'draft',
        token_expires_at: tokenExpires.toISOString(),
        sent_at: andSend ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al guardar', { description: error.message })
      setSaving(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_trail').insert({
      contract_id: data.id,
      action: 'created',
      actor_type: 'admin',
      actor_email: user?.email,
    })

    if (andSend) {
      await supabase.from('audit_trail').insert({
        contract_id: data.id,
        action: 'sent',
        actor_type: 'admin',
        actor_email: user?.email,
        metadata: { signer_email: signerEmail },
      })
    }

    // 4. Guardar cuotas de pago
    if (cuotas.length > 0) {
      const installments = cuotas
        .filter(c => c.monto && c.fecha)
        .map((c, i) => ({
          contract_id: data.id,
          numero_cuota: i + 1,
          descripcion: c.descripcion || `Cuota ${i + 1}`,
          monto: parseFloat(c.monto),
          moneda: formData.moneda || 'COP',
          fecha_vencimiento: c.fecha,
        }))
      if (installments.length > 0) {
        await supabase.from('payment_installments').insert(installments)
      }
    }

    toast.success(andSend ? 'Contrato creado y enviado' : 'Contrato guardado como borrador')
    navigate(`/contracts/${data.id}`)
    setSaving(false)
  }

  const renderField = (variable: TemplateVariable) => {
    const value = formData[variable.key] || ''
    const commonProps = {
      id: variable.key,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        handleFieldChange(variable.key, e.target.value),
      placeholder: variable.placeholder,
      required: variable.required,
    }

    if (variable.key === 'pais') {
      return (
        <Select {...commonProps} onChange={e => {
          handleFieldChange('pais', e.target.value)
          handleFieldChange('departamento', '')
          handleFieldChange('ciudad', '')
        }}>
          <option value="">Seleccionar país...</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      )
    }

    if (variable.key === 'departamento') {
      const pais = formData.pais || ''
      if (hasLocationData(pais)) {
        return (
          <Select {...commonProps} onChange={e => {
            handleFieldChange('departamento', e.target.value)
            handleFieldChange('ciudad', '')
          }}>
            <option value="">Seleccionar...</option>
            {getDepartments(pais).map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
        )
      }
      return <Input {...commonProps} type="text" placeholder="Escribir..." />
    }

    if (variable.key === 'ciudad') {
      const pais = formData.pais || ''
      const depto = formData.departamento || ''
      if (hasLocationData(pais) && depto) {
        return (
          <Select {...commonProps}>
            <option value="">Seleccionar...</option>
            {getCities(pais, depto).map(c => <option key={c} value={c}>{c}</option>)}
            <option value="__otra">Otra ciudad...</option>
          </Select>
        )
      }
      return <Input {...commonProps} type="text" placeholder="Escribir..." />
    }

    switch (variable.type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />
      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Seleccionar...</option>
            {variable.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </Select>
        )
      default:
        return (
          <Input
            {...commonProps}
            type={variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : variable.type === 'email' ? 'email' : 'text'}
          />
        )
    }
  }

  if (loadingTemplates) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Contrato</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Selecciona una plantilla y completa los datos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Selector de plantilla */}
          <Card>
            <CardHeader><CardTitle className="text-base">Plantilla</CardTitle></CardHeader>
            <CardContent>
              <Select onChange={e => handleTemplateSelect(e.target.value)} value={selectedTemplate?.id || ''}>
                <option value="">Seleccionar plantilla...</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </CardContent>
          </Card>

          {/* Selector de contacto existente */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedContact ? (
                  <div className="flex items-center justify-between p-3 bg-[hsl(var(--secondary))] rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck size={18} className="text-green-600" />
                      <div>
                        <p className="font-medium text-sm">
                          {selectedContact.tipo_persona === 'natural'
                            ? selectedContact.nombre_completo
                            : selectedContact.empresa}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {selectedContact.email || ''} {selectedContact.numero_documento || selectedContact.id_fiscal || ''}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearContact}><X size={16} /></Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant={showContactSearch ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowContactSearch(!showContactSearch)}
                      >
                        <Search size={14} className="mr-1" /> Buscar existente
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowContactSearch(false)}>
                        <UserPlus size={14} className="mr-1" /> Crear nuevo
                      </Button>
                    </div>

                    {showContactSearch && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Buscar por nombre, empresa, CC, NIT, email..."
                          value={contactSearch}
                          onChange={e => setContactSearch(e.target.value)}
                          autoFocus
                        />
                        {searchingContacts && <p className="text-xs text-[hsl(var(--muted-foreground))]">Buscando...</p>}
                        {contactResults.length > 0 && (
                          <div className="border rounded-md max-h-48 overflow-auto">
                            {contactResults.map(c => (
                              <button
                                key={c.id}
                                onClick={() => selectContact(c)}
                                className="w-full text-left p-2 hover:bg-[hsl(var(--secondary))] border-b last:border-0 text-sm"
                              >
                                <span className="font-medium">
                                  {c.tipo_persona === 'natural' ? c.nombre_completo : c.empresa}
                                </span>
                                <span className="text-[hsl(var(--muted-foreground))] ml-2">
                                  {c.numero_documento || c.id_fiscal || ''} · {c.email || ''} · {c.pais}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                        {contactSearch.length >= 2 && contactResults.length === 0 && !searchingContacts && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">No se encontró. Llena los datos abajo para crear uno nuevo.</p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Si el contacto no existe, se creará automáticamente al guardar el contrato.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tipo de Stand (solo para templates de stand) */}
          {selectedTemplate && selectedTemplate.variables.some(v => v.key === 'tamano_stand') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tipo de Stand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '2×2', medidas: '2x2', m2: 4, tipo: 'Estándar' },
                    { label: '2×3', medidas: '2x3', m2: 6, tipo: 'Estándar' },
                    { label: '4×2', medidas: '4x2', m2: 8, tipo: 'Estándar' },
                    { label: '4×3', medidas: '4x3', m2: 12, tipo: 'Estándar' },
                    { label: '5×3', medidas: '5x3', m2: 15, tipo: 'Estándar' },
                    { label: '6×3', medidas: '6x3', m2: 18, tipo: 'Estándar' },
                    { label: '5×3 Isla', medidas: '5x3', m2: 15, tipo: 'Tipo Isla' },
                    { label: '6×3 Isla', medidas: '6x3', m2: 18, tipo: 'Tipo Isla' },
                    { label: '6×4', medidas: '6x4', m2: 24, tipo: 'Estándar' },
                  ].map(stand => {
                    const isSelected = formData.tamano_stand === `${stand.m2} m² (${stand.medidas} - ${stand.tipo})`
                    return (
                      <button
                        key={stand.label}
                        type="button"
                        onClick={() => {
                          handleFieldChange('tamano_stand', `${stand.m2} m² (${stand.medidas} - ${stand.tipo})`)
                        }}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          isSelected
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                            : 'hover:bg-[hsl(var(--secondary))]'
                        }`}
                      >
                        <p className="font-bold text-lg">{stand.label}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{stand.m2} m²</p>
                        {stand.tipo !== 'Estándar' && (
                          <p className="text-xs font-medium mt-1">{stand.tipo}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
                {formData.tamano_stand && (
                  <p className="text-sm bg-[hsl(var(--secondary))] p-2 rounded">
                    Seleccionado: <strong>{formData.tamano_stand}</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Datos del contrato */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del Contrato</CardTitle>
                {signerName && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    Firmante: {signerName}{signerCompany ? ` · ${signerCompany}` : ''}{signerEmail ? ` · ${signerEmail}` : ''}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleVariables.map(variable => (
                  <div key={variable.key} className="space-y-2">
                    <Label htmlFor={variable.key}>
                      {variable.label} {variable.required && <span className="text-[hsl(var(--destructive))]">*</span>}
                    </Label>
                    {renderField(variable)}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Valor y Cronograma de pagos */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Valor y Forma de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Valor total y moneda */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2 col-span-2">
                    <Label>Valor total (IVA incluido) *</Label>
                    <Input
                      type="text"
                      value={formData.valor_total || formData.honorarios || ''}
                      onChange={e => {
                        // Actualizar todos los posibles keys de valor según template
                        handleFieldChange('valor_total', e.target.value)
                        handleFieldChange('honorarios', e.target.value)
                      }}
                      placeholder="10.000.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Moneda</Label>
                    <Select
                      value={formData.moneda || 'COP'}
                      onChange={e => handleFieldChange('moneda', e.target.value)}
                    >
                      <option value="COP">COP</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </Select>
                  </div>
                </div>

                {(formData.valor_total || formData.honorarios) && (
                  <div className="text-sm bg-[hsl(var(--secondary))] p-3 rounded">
                    <span className="text-[hsl(var(--muted-foreground))]">En letras: </span>
                    <span className="font-medium">
                      {moneyToWords(formData.valor_total || formData.honorarios || '0', formData.moneda || 'COP')}
                    </span>
                  </div>
                )}

                {/* Modalidad de pago */}
                <div className="space-y-2">
                  <Label>Modalidad de pago</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={numCuotas === 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        handleNumCuotasChange(1)
                        setCuotas([{ descripcion: 'Pago único de contado', monto: formData.valor_total || formData.honorarios || '', fecha: '' }])
                      }}
                    >
                      Pago de contado
                    </Button>
                    <Button
                      type="button"
                      variant={numCuotas > 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (numCuotas <= 1) handleNumCuotasChange(2)
                      }}
                    >
                      Pago por cuotas
                    </Button>
                    <Button
                      type="button"
                      variant={numCuotas === 0 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleNumCuotasChange(0)}
                    >
                      Sin definir aún
                    </Button>
                  </div>
                </div>

                {/* Número de cuotas (solo si es por cuotas) */}
                {numCuotas > 1 && (
                  <div className="flex items-center gap-3">
                    <Label>Número de cuotas</Label>
                    <Select
                      value={String(numCuotas)}
                      onChange={e => handleNumCuotasChange(Number(e.target.value))}
                      className="w-24"
                    >
                      {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Detalle de cuotas */}
                {cuotas.map((cuota, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 p-3 border rounded-lg bg-[hsl(var(--secondary))]">
                    <div className="space-y-1">
                      <Label className="text-xs">Descripción</Label>
                      <Input
                        value={cuota.descripcion}
                        onChange={e => updateCuota(i, 'descripcion', e.target.value)}
                        placeholder={`Cuota ${i + 1}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Monto ({formData.moneda || 'COP'}) *</Label>
                      <Input
                        type="number"
                        value={cuota.monto}
                        onChange={e => updateCuota(i, 'monto', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fecha límite *</Label>
                      <Input
                        type="date"
                        value={cuota.fecha}
                        onChange={e => updateCuota(i, 'fecha', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                {/* Resumen de pagos */}
                {cuotas.length > 0 && cuotas.some(c => c.monto) && (
                  <div className="text-sm bg-[hsl(var(--secondary))] p-3 rounded space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--muted-foreground))]">Total cuotas:</span>
                      <span className="font-medium">
                        {formData.moneda || 'COP'} ${new Intl.NumberFormat('es-CO').format(cuotas.reduce((s, c) => s + (Number(c.monto) || 0), 0))}
                      </span>
                    </div>
                    {formData.valor_total && (
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--muted-foreground))]">Diferencia con valor total:</span>
                        <span className={`font-medium ${Math.abs(Number(formData.valor_total) - cuotas.reduce((s, c) => s + (Number(c.monto) || 0), 0)) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {formData.moneda || 'COP'} ${new Intl.NumberFormat('es-CO').format(Number(formData.valor_total) - cuotas.reduce((s, c) => s + (Number(c.monto) || 0), 0))}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-[hsl(var(--muted-foreground))] pt-2 border-t mt-2">
                      <strong>Forma de pago en contrato:</strong> {formaPagoFromCuotas}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          {selectedTemplate && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>Guardar Borrador</Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>{saving ? 'Guardando...' : 'Crear y Enviar'}</Button>
              <Button variant="ghost" onClick={() => setShowPreview(!showPreview)} className="lg:hidden">
                {showPreview ? 'Ocultar' : 'Ver'} Preview
              </Button>
            </div>
          )}
        </div>

        {/* Preview */}
        {selectedTemplate && (
          <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
            <Card className="sticky top-6">
              <CardHeader><CardTitle className="text-base">Vista Previa</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none border rounded-md p-4 bg-white text-black overflow-auto max-h-[70vh]"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
