import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useContracts } from '@/hooks/useContracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import type { ContractStatus } from '@/lib/types'

export function Contracts() {
  const [status, setStatus] = useState<ContractStatus | ''>('')
  const [search, setSearch] = useState('')
  const { contracts, loading } = useContracts({
    status: status || undefined,
    search: search || undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-[hsl(var(--muted-foreground))]">{contracts.length} contrato(s)</p>
        </div>
        <Link to="/contracts/new">
          <Button>
            <Plus size={16} className="mr-2" />
            Nuevo Contrato
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]"
          />
          <Input
            placeholder="Buscar por nombre, email o título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ContractStatus | '')}
          className="w-full sm:w-48"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="sent">Enviado</option>
          <option value="viewed">Visto</option>
          <option value="signed">Firmado</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[hsl(var(--primary))]" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
              No se encontraron contratos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[hsl(var(--secondary))]">
                    <th className="p-3 text-left font-medium">Título</th>
                    <th className="p-3 text-left font-medium">Firmante</th>
                    <th className="p-3 text-left font-medium">Email</th>
                    <th className="p-3 text-left font-medium">Estado</th>
                    <th className="p-3 text-left font-medium">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="border-b last:border-0 hover:bg-[hsl(var(--secondary))]/50"
                    >
                      <td className="p-3">
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="text-[hsl(var(--primary))] hover:underline font-medium"
                        >
                          {contract.title}
                        </Link>
                      </td>
                      <td className="p-3">{contract.signer_name}</td>
                      <td className="p-3 text-[hsl(var(--muted-foreground))]">
                        {contract.signer_email}
                      </td>
                      <td className="p-3">
                        <ContractStatusBadge status={contract.status} />
                      </td>
                      <td className="p-3 text-[hsl(var(--muted-foreground))]">
                        {new Date(contract.created_at).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
