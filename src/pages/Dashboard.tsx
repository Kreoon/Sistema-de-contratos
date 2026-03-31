import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Send, CheckCircle, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import type { Contract, ContractStatus } from '@/lib/types'

interface Stats {
  total: number
  draft: number
  sent: number
  viewed: number
  signed: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, draft: 0, sent: 0, viewed: 0, signed: 0 })
  const [recent, setRecent] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: contracts } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })

      if (contracts) {
        setStats({
          total: contracts.length,
          draft: contracts.filter(c => c.status === 'draft').length,
          sent: contracts.filter(c => c.status === 'sent' || c.status === 'viewed').length,
          viewed: contracts.filter(c => c.status === 'viewed').length,
          signed: contracts.filter(c => c.status === 'signed' || c.status === 'completed').length,
        })
        setRecent(contracts.slice(0, 5) as Contract[])
      }
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Contratos', value: stats.total, icon: FileText, color: 'text-blue-500' },
    { label: 'Pendientes de Envío', value: stats.draft, icon: FileText, color: 'text-gray-500' },
    { label: 'Enviados', value: stats.sent, icon: Send, color: 'text-orange-500' },
    { label: 'Firmados', value: stats.signed, icon: CheckCircle, color: 'text-green-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Resumen de contratos Feria Effix</p>
        </div>
        <Link to="/contracts/new">
          <Button>
            <Plus size={16} className="mr-2" />
            Nuevo Contrato
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {label}
              </CardTitle>
              <Icon size={18} className={color} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contratos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-center py-8">
              No hay contratos aún.{' '}
              <Link to="/contracts/new" className="text-[hsl(var(--primary))] underline">
                Crea el primero
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Título</th>
                    <th className="pb-3 font-medium">Firmante</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((contract) => (
                    <tr key={contract.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="text-[hsl(var(--primary))] hover:underline"
                        >
                          {contract.title}
                        </Link>
                      </td>
                      <td className="py-3">{contract.signer_name}</td>
                      <td className="py-3">
                        <ContractStatusBadge status={contract.status as ContractStatus} />
                      </td>
                      <td className="py-3 text-[hsl(var(--muted-foreground))]">
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
