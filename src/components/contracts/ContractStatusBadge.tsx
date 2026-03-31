import { Badge } from '@/components/ui/badge'
import type { ContractStatus } from '@/lib/types'

const statusConfig: Record<
  ContractStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  }
> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  sent: { label: 'Enviado', variant: 'default' },
  viewed: { label: 'Visto', variant: 'warning' },
  signed: { label: 'Firmado', variant: 'success' },
  completed: { label: 'Completado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
