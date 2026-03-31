import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Phone, Globe, MapPin, Building, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import type { Contact, Contract, ContactCategory, ContractStatus } from '@/lib/types'

const categoryConfig: Record<
  ContactCategory,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  lead: { label: 'Lead', variant: 'secondary' },
  prospecto: { label: 'Prospecto', variant: 'warning' },
  cliente: { label: 'Cliente', variant: 'success' },
  inactivo: { label: 'Inactivo', variant: 'destructive' },
}

export function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const [contact, setContact] = useState<Contact | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      const [contactRes, contractsRes] = await Promise.all([
        supabase.from('contacts_with_stats').select('*').eq('id', id).single(),
        supabase
          .from('contracts')
          .select('*')
          .eq('contact_id', id)
          .order('created_at', { ascending: false }),
      ])

      if (contactRes.data) setContact(contactRes.data as Contact)
      if (contractsRes.data) setContracts(contractsRes.data as Contract[])
      setLoading(false)
    }

    load()
  }, [id])

  const updateCategory = async (categoria: ContactCategory) => {
    if (!contact) return
    const { error } = await supabase
      .from('contacts')
      .update({ categoria })
      .eq('id', contact.id)

    if (!error) {
      setContact(prev => (prev ? { ...prev, categoria } : null))
      toast.success('Categoria actualizada')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"
          role="status"
          aria-label="Cargando contacto"
        />
      </div>
    )
  }

  if (!contact) {
    return <div className="text-center py-12">Contacto no encontrado</div>
  }

  const cat = categoryConfig[contact.categoria]
  const isJuridica = contact.tipo_persona === 'juridica'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/contacts">
          <Button variant="ghost" size="icon" aria-label="Volver a contactos">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{contact.display_name}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {isJuridica ? 'Persona Juridica' : 'Persona Natural'}
            {contact.pais !== 'Colombia' ? ` · ${contact.pais}` : ''}
          </p>
        </div>
        <Badge variant={cat.variant}>{cat.label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Identidad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isJuridica ? 'Empresa' : 'Identificacion'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {isJuridica ? (
                <>
                  <div className="flex items-center gap-2">
                    <Building size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    {contact.empresa}
                    {contact.sigla ? ` (${contact.sigla})` : ''}
                  </div>
                  {contact.id_fiscal && (
                    <div>NIT/Tax ID: {contact.id_fiscal}</div>
                  )}
                  {contact.representante_legal && (
                    <div className="flex items-center gap-1">
                      <User size={14} className="inline" aria-hidden="true" />
                      Rep. Legal: {contact.representante_legal}
                    </div>
                  )}
                  {contact.numero_documento_representante && (
                    <div>
                      {contact.tipo_documento_representante}{' '}
                      {contact.numero_documento_representante}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                    {contact.nombre_completo}
                  </div>
                  {contact.numero_documento && (
                    <div>
                      {contact.tipo_documento} {contact.numero_documento}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Informacion de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  {contact.email}
                </div>
              )}
              {contact.celular && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  {contact.celular}
                </div>
              )}
              {contact.telefono && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  {contact.telefono}
                </div>
              )}
              {contact.web_redes && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  {contact.web_redes}
                </div>
              )}
              {(contact.ciudad || contact.pais) && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
                  {[contact.direccion, contact.ciudad, contact.departamento, contact.pais]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
              {contact.persona_encargada && (
                <div className="mt-3 pt-3 border-t">
                  <p className="font-medium text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    Persona encargada
                  </p>
                  <div>{contact.persona_encargada}</div>
                  {contact.email_encargada && (
                    <div className="text-[hsl(var(--muted-foreground))]">
                      {contact.email_encargada}
                    </div>
                  )}
                  {contact.celular_encargada && (
                    <div className="text-[hsl(var(--muted-foreground))]">
                      {contact.celular_encargada}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CRM */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">CRM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Categoria</p>
                <Select
                  value={contact.categoria}
                  onChange={e => updateCategory(e.target.value as ContactCategory)}
                  aria-label="Cambiar categoria del contacto"
                >
                  <option value="lead">Lead</option>
                  <option value="prospecto">Prospecto</option>
                  <option value="cliente">Cliente</option>
                  <option value="inactivo">Inactivo</option>
                </Select>
              </div>
              {contact.fuente && (
                <div className="text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Fuente:</span>{' '}
                  {contact.fuente}
                </div>
              )}
              {contact.notas && (
                <div className="text-sm bg-[hsl(var(--secondary))] p-3 rounded">
                  {contact.notas}
                </div>
              )}
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Creado: {new Date(contact.created_at).toLocaleDateString('es-CO')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: contratos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Contratos ({contracts.length})</CardTitle>
                <Link to={`/contracts/new?contact=${contact.id}`}>
                  <Button size="sm">Nuevo Contrato</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <p className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                  Sin contratos aun
                </p>
              ) : (
                <div className="space-y-3">
                  {contracts.map(contract => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-[hsl(var(--secondary))]/50"
                    >
                      <div>
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="text-[hsl(var(--primary))] hover:underline font-medium text-sm"
                        >
                          {contract.title}
                        </Link>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {new Date(contract.created_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <ContractStatusBadge status={contract.status as ContractStatus} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
