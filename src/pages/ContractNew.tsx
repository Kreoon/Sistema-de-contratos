import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, UserPlus, UserCheck, X } from 'lucide-react'
import { useTemplates } from '@/hooks/useTemplates'
import { supabase } from '@/lib/supabase'
import { renderTemplate } from '@/lib/template-engine'
import { ORGANIZER } from '@/lib/organizer'
import { COUNTRIES } from '@/lib/countries'
import { getDepartments, getCities, hasLocationData } from '@/lib/locations'
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

  const templateData = {
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
  }
  const renderedHtml = selectedTemplate ? renderTemplate(selectedTemplate.content, templateData) : ''

  const visibleVariables = selectedTemplate?.variables.filter(v => {
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
