import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, UserCheck, UserPlus } from 'lucide-react'
import { useContacts } from '@/hooks/useContacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ContactCategory } from '@/lib/types'

const categoryConfig: Record<
  ContactCategory,
  { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  lead: { label: 'Lead', variant: 'secondary' },
  prospecto: { label: 'Prospecto', variant: 'warning' },
  cliente: { label: 'Cliente', variant: 'success' },
  inactivo: { label: 'Inactivo', variant: 'destructive' },
}

export function Contacts_CRM() {
  const [categoria, setCategoria] = useState<ContactCategory | ''>('')
  const [search, setSearch] = useState('')

  const { contacts, loading } = useContacts({
    categoria: categoria || undefined,
    search: search || undefined,
  })

  const stats = {
    total: contacts.length,
    clientes: contacts.filter(c => c.categoria === 'cliente').length,
    prospectos: contacts.filter(c => c.categoria === 'prospecto').length,
    leads: contacts.filter(c => c.categoria === 'lead').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Base de datos de ponentes, expositores y patrocinadores
          </p>
        </div>
        <Link to="/contacts/new">
          <Button>
            <Plus size={16} className="mr-2" />
            Nuevo Contacto
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Clientes', value: stats.clientes, icon: UserCheck, color: 'text-green-500' },
          { label: 'Prospectos', value: stats.prospectos, icon: UserPlus, color: 'text-orange-500' },
          { label: 'Leads', value: stats.leads, icon: UserPlus, color: 'text-gray-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {label}
              </CardTitle>
              <Icon size={18} className={color} aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]"
            aria-hidden="true"
          />
          <Input
            placeholder="Buscar por nombre, empresa o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Buscar contactos"
          />
        </div>
        <Select
          value={categoria}
          onChange={e => setCategoria(e.target.value as ContactCategory | '')}
          className="w-full sm:w-44"
          aria-label="Filtrar por categoría"
        >
          <option value="">Todas las categorías</option>
          <option value="lead">Lead</option>
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente</option>
          <option value="inactivo">Inactivo</option>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div
                className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))]"
                role="status"
                aria-label="Cargando contactos"
              />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              No se encontraron contactos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Lista de contactos">
                <thead>
                  <tr className="border-b bg-[hsl(var(--secondary))]">
                    <th className="p-3 text-left font-medium">Nombre / Empresa</th>
                    <th className="p-3 text-left font-medium">Email</th>
                    <th className="p-3 text-left font-medium">País</th>
                    <th className="p-3 text-left font-medium">Categoría</th>
                    <th className="p-3 text-left font-medium">Contratos</th>
                    <th className="p-3 text-left font-medium">Último</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => {
                    const cat = categoryConfig[contact.categoria]
                    return (
                      <tr
                        key={contact.id}
                        className="border-b last:border-0 hover:bg-[hsl(var(--secondary))]/50"
                      >
                        <td className="p-3">
                          <Link
                            to={`/contacts/${contact.id}`}
                            className="text-[hsl(var(--primary))] hover:underline font-medium"
                          >
                            {contact.display_name || 'Sin nombre'}
                          </Link>
                          {contact.tipo_persona === 'juridica' && contact.representante_legal && (
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">
                              {contact.representante_legal}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-[hsl(var(--muted-foreground))]">
                          {contact.email || '-'}
                        </td>
                        <td className="p-3">{contact.pais}</td>
                        <td className="p-3">
                          <Badge variant={cat.variant}>{cat.label}</Badge>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{contact.total_contratos || 0}</span>
                          {(contact.contratos_firmados ?? 0) > 0 && (
                            <span className="text-xs text-green-600 ml-1">
                              ({contact.contratos_firmados} firmados)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[hsl(var(--muted-foreground))]">
                          {contact.ultimo_contrato
                            ? new Date(contact.ultimo_contrato).toLocaleDateString('es-CO')
                            : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
