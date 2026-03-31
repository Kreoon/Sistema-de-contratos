import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { COUNTRIES } from '@/lib/countries'
import { getDepartments, getCities, hasLocationData } from '@/lib/locations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PersonType, ContactCategory } from '@/lib/types'

export function ContactNew() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [tipoPersona, setTipoPersona] = useState<PersonType>('natural')
  const [form, setForm] = useState<Record<string, string>>({
    pais: 'Colombia',
    categoria: 'lead',
  })

  const set = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    // Validar campos obligatorios según tipo de persona
    const missing: string[] = []

    if (tipoPersona === 'natural') {
      if (!form.nombre_completo) missing.push('Nombre completo')
      if (!form.tipo_documento) missing.push('Tipo documento')
      if (!form.numero_documento) missing.push('Número documento')
    } else {
      if (!form.empresa) missing.push('Empresa')
      if (!form.id_fiscal) missing.push('NIT / Tax ID')
      if (!form.representante_legal) missing.push('Representante legal')
    }

    // Obligatorios para todos
    if (!form.email) missing.push('Email')
    if (!form.celular) missing.push('Celular')
    if (!form.pais) missing.push('País')
    if (!form.departamento) missing.push('Departamento/Estado')
    if (!form.ciudad || form.ciudad === '__otro') missing.push('Ciudad')
    if (!form.direccion) missing.push('Dirección')

    if (missing.length > 0) {
      toast.error('Campos obligatorios faltantes', { description: missing.join(', ') })
      return
    }

    setSaving(true)
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        tipo_persona: tipoPersona,
        nombre_completo: form.nombre_completo || null,
        tipo_documento: form.tipo_documento || null,
        numero_documento: form.numero_documento || null,
        empresa: form.empresa || null,
        id_fiscal: form.id_fiscal || null,
        sigla: form.sigla || null,
        representante_legal: form.representante_legal || null,
        tipo_documento_representante: form.tipo_documento_representante || null,
        numero_documento_representante: form.numero_documento_representante || null,
        email: form.email || null,
        telefono: form.telefono || null,
        celular: form.celular || null,
        direccion: form.direccion || null,
        ciudad: form.ciudad || null,
        departamento: form.departamento || null,
        pais: form.pais || 'Colombia',
        web_redes: form.web_redes || null,
        persona_encargada: form.persona_encargada || null,
        email_encargada: form.email_encargada || null,
        celular_encargada: form.celular_encargada || null,
        categoria: (form.categoria || 'lead') as ContactCategory,
        notas: form.notas || null,
        fuente: form.fuente || null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al guardar', { description: error.message })
    } else {
      toast.success('Contacto creado')
      navigate(`/contacts/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Contacto</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Agregar persona o empresa al CRM</p>
      </div>

      {/* Tipo persona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipo de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={tipoPersona === 'natural' ? 'default' : 'outline'}
              onClick={() => setTipoPersona('natural')}
            >
              Persona Natural
            </Button>
            <Button
              variant={tipoPersona === 'juridica' ? 'default' : 'outline'}
              onClick={() => setTipoPersona('juridica')}
            >
              Persona Juridica
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Identificacion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tipoPersona === 'natural' ? 'Datos Personales' : 'Datos de la Empresa'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tipoPersona === 'natural' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="nombre_completo">Nombre completo *</Label>
                <Input
                  id="nombre_completo"
                  value={form.nombre_completo || ''}
                  onChange={e => set('nombre_completo', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento">Tipo documento *</Label>
                  <Select
                    id="tipo_documento"
                    value={form.tipo_documento || ''}
                    onChange={e => set('tipo_documento', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="C.C.">C.C.</option>
                    <option value="C.E.">C.E.</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="DNI">DNI</option>
                    <option value="Tax ID">Tax ID</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_documento">Número documento *</Label>
                  <Input
                    id="numero_documento"
                    value={form.numero_documento || ''}
                    onChange={e => set('numero_documento', e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={form.empresa || ''}
                    onChange={e => set('empresa', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_fiscal">NIT / Tax ID *</Label>
                  <Input
                    id="id_fiscal"
                    value={form.id_fiscal || ''}
                    onChange={e => set('id_fiscal', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sigla">Sigla</Label>
                <Input
                  id="sigla"
                  value={form.sigla || ''}
                  onChange={e => set('sigla', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="representante_legal">Representante legal *</Label>
                  <Input
                    id="representante_legal"
                    value={form.representante_legal || ''}
                    onChange={e => set('representante_legal', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_documento_representante">Documento representante *</Label>
                  <Input
                    id="numero_documento_representante"
                    value={form.numero_documento_representante || ''}
                    onChange={e => set('numero_documento_representante', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Informacion de contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacion de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email || ''}
                onChange={e => set('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular">Celular *</Label>
              <Input
                id="celular"
                value={form.celular || ''}
                onChange={e => set('celular', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Ubicación: País → Departamento → Ciudad → Dirección */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pais">País *</Label>
              <Select
                id="pais"
                value={form.pais || 'Colombia'}
                onChange={e => {
                  set('pais', e.target.value)
                  set('departamento', '')
                  set('ciudad', '')
                }}
                required
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento/Estado *</Label>
              {hasLocationData(form.pais || 'Colombia') ? (
                <Select
                  id="departamento"
                  value={form.departamento || ''}
                  onChange={e => {
                    set('departamento', e.target.value)
                    set('ciudad', '')
                  }}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {getDepartments(form.pais || 'Colombia').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              ) : (
                <Input
                  id="departamento"
                  value={form.departamento || ''}
                  onChange={e => set('departamento', e.target.value)}
                  placeholder="Escribir..."
                  required
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              {hasLocationData(form.pais || 'Colombia') && form.departamento ? (
                <Select
                  id="ciudad"
                  value={form.ciudad || ''}
                  onChange={e => set('ciudad', e.target.value)}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {getCities(form.pais || 'Colombia', form.departamento).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__otro">Otra ciudad...</option>
                </Select>
              ) : (
                <Input
                  id="ciudad"
                  value={form.ciudad || ''}
                  onChange={e => set('ciudad', e.target.value)}
                  placeholder="Escribir..."
                  required
                />
              )}
            </div>
          </div>
          {form.ciudad === '__otro' && (
            <div className="space-y-2">
              <Label htmlFor="ciudad_manual">Escribir ciudad *</Label>
              <Input
                id="ciudad_manual"
                value=""
                onChange={e => set('ciudad', e.target.value)}
                placeholder="Nombre de la ciudad..."
                autoFocus
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={form.direccion || ''}
              onChange={e => set('direccion', e.target.value)}
              required
            />
          </div>

          {/* Opcionales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono fijo <span className="text-[hsl(var(--muted-foreground))] text-xs">(opcional)</span></Label>
              <Input
                id="telefono"
                value={form.telefono || ''}
                onChange={e => set('telefono', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="web_redes">Web / Redes sociales <span className="text-[hsl(var(--muted-foreground))] text-xs">(opcional)</span></Label>
              <Input
                id="web_redes"
                value={form.web_redes || ''}
                onChange={e => set('web_redes', e.target.value)}
              />
            </div>
          </div>

          {tipoPersona === 'juridica' && (
            <>
              <hr />
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Persona encargada (contacto directo)</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (form.representante_legal) set('persona_encargada', form.representante_legal)
                    if (form.email) set('email_encargada', form.email)
                    if (form.celular) set('celular_encargada', form.celular)
                  }}
                >
                  Misma persona del contrato
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="persona_encargada">Nombre</Label>
                  <Input
                    id="persona_encargada"
                    value={form.persona_encargada || ''}
                    onChange={e => set('persona_encargada', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_encargada">Email</Label>
                  <Input
                    id="email_encargada"
                    type="email"
                    value={form.email_encargada || ''}
                    onChange={e => set('email_encargada', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="celular_encargada">Celular</Label>
                  <Input
                    id="celular_encargada"
                    value={form.celular_encargada || ''}
                    onChange={e => set('celular_encargada', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Clasificacion CRM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clasificacion CRM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                id="categoria"
                value={form.categoria || 'lead'}
                onChange={e => set('categoria', e.target.value)}
              >
                <option value="lead">Lead</option>
                <option value="prospecto">Prospecto</option>
                <option value="cliente">Cliente</option>
                <option value="inactivo">Inactivo</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuente">Fuente</Label>
              <Select
                id="fuente"
                value={form.fuente || ''}
                onChange={e => set('fuente', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="feria_effix_2026">Feria Effix 2026</option>
                <option value="referido">Referido</option>
                <option value="web">Web</option>
                <option value="redes_sociales">Redes sociales</option>
                <option value="llamada">Llamada</option>
                <option value="otro">Otro</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={form.notas || ''}
              onChange={e => set('notas', e.target.value)}
              rows={3}
              placeholder="Notas internas sobre este contacto..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Contacto'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/contacts')}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
