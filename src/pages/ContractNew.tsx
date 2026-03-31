import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useTemplates } from '@/hooks/useTemplates'
import { supabase } from '@/lib/supabase'
import { renderTemplate } from '@/lib/template-engine'
import { ORGANIZER } from '@/lib/organizer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ContractTemplate, TemplateVariable } from '@/lib/types'

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

  // Smart signer name detection basado en tipo_persona
  useEffect(() => {
    if (formData.tipo_persona === 'Persona Natural' && formData.nombre_completo) {
      setSignerName(formData.nombre_completo)
      setSignerCompany('')
    } else if (formData.tipo_persona === 'Persona Jurídica') {
      if (formData.representante_legal) setSignerName(formData.representante_legal)
      if (formData.empresa) setSignerCompany(formData.empresa)
    }
  }, [formData.tipo_persona, formData.nombre_completo, formData.representante_legal, formData.empresa])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
    setFormData({})
  }

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Merge de datos del organizador con formData para renderizado
  const templateData = {
    org_nombre: ORGANIZER.nombre,
    org_documento_tipo: ORGANIZER.documento_tipo,
    org_documento: ORGANIZER.documento,
    org_empresa: ORGANIZER.empresa,
    org_nit: ORGANIZER.nit,
    ...formData,
  }
  const renderedHtml = selectedTemplate ? renderTemplate(selectedTemplate.content, templateData) : ''

  // Filtrado de variables visibles según tipo_persona
  const visibleVariables = selectedTemplate?.variables.filter(v => {
    const persona = formData.tipo_persona
    const naturalOnly = ['nombre_completo', 'tipo_documento', 'numero_documento']
    const juridicaOnly = [
      'empresa',
      'id_fiscal',
      'representante_legal',
      'tipo_documento_representante',
      'numero_documento_representante',
    ]

    if (naturalOnly.includes(v.key) && persona === 'Persona Jurídica') return false
    if (juridicaOnly.includes(v.key) && persona === 'Persona Natural') return false
    return true
  }) ?? []

  const handleSave = async (andSend: boolean) => {
    if (!selectedTemplate) return
    if (!signerName || !signerEmail) {
      toast.error('Nombre y email del firmante son requeridos')
      return
    }

    const missing = selectedTemplate.variables
      .filter(v => v.required && !formData[v.key])
      .map(v => v.label)
    if (missing.length > 0) {
      toast.error('Campos requeridos faltantes', { description: missing.join(', ') })
      return
    }

    setSaving(true)
    const title = `${selectedTemplate.name} - ${signerName}`

    const tokenExpires = new Date()
    tokenExpires.setDate(tokenExpires.getDate() + 30)

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        template_id: selectedTemplate.id,
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => handleFieldChange(variable.key, e.target.value),
      placeholder: variable.placeholder,
      required: variable.required,
    }

    switch (variable.type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />
      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Seleccionar...</option>
            {variable.options?.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        )
      default:
        return (
          <Input
            {...commonProps}
            type={
              variable.type === 'number'
                ? 'number'
                : variable.type === 'date'
                  ? 'date'
                  : variable.type === 'email'
                    ? 'email'
                    : 'text'
            }
          />
        )
    }
  }

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Contrato</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Selecciona una plantilla y completa los datos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-6">
          {/* Selector de plantilla */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Plantilla</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                onChange={(e) => handleTemplateSelect(e.target.value)}
                value={selectedTemplate?.id || ''}
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Datos del firmante */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del Firmante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signer_name">Nombre completo *</Label>
                    <Input
                      id="signer_name"
                      value={signerName}
                      onChange={e => setSignerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signer_email">Email *</Label>
                    <Input
                      id="signer_email"
                      type="email"
                      value={signerEmail}
                      onChange={e => setSignerEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signer_doc">Cedula/NIT</Label>
                    <Input
                      id="signer_doc"
                      value={signerDocId}
                      onChange={e => setSignerDocId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signer_company">Empresa</Label>
                    <Input
                      id="signer_company"
                      value={signerCompany}
                      onChange={e => setSignerCompany(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variables del template */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleVariables.map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <Label htmlFor={variable.key}>
                      {variable.label}{' '}
                      {variable.required && (
                        <span className="text-[hsl(var(--destructive))]">*</span>
                      )}
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
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                Guardar Borrador
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                {saving ? 'Guardando...' : 'Crear y Enviar'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden"
              >
                {showPreview ? 'Ocultar' : 'Ver'} Preview
              </Button>
            </div>
          )}
        </div>

        {/* Preview */}
        {selectedTemplate && (
          <div className={`${showPreview ? 'block' : 'hidden'} lg:block`}>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Vista Previa</CardTitle>
              </CardHeader>
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
