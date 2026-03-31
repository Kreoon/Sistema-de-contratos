import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Check, Clock, AlertTriangle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PaymentInstallment, PaymentStatus } from '@/lib/types'

const statusConfig: Record<
  PaymentStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
    icon: typeof Check
  }
> = {
  pendiente: { label: 'Pendiente', variant: 'secondary', icon: Clock },
  pagado: { label: 'Pagado', variant: 'success', icon: Check },
  vencido: { label: 'Vencido', variant: 'destructive', icon: AlertTriangle },
  cancelado: { label: 'Cancelado', variant: 'default', icon: Trash2 },
}

interface Props {
  contractId: string
  moneda?: string
}

export function PaymentSchedule({ contractId, moneda = 'COP' }: Props) {
  const [installments, setInstallments] = useState<PaymentInstallment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newCuota, setNewCuota] = useState({ descripcion: '', monto: '', fecha_vencimiento: '' })

  const fetchInstallments = async () => {
    const { data } = await supabase
      .from('payment_installments')
      .select('*')
      .eq('contract_id', contractId)
      .order('numero_cuota')
    if (data) setInstallments(data as PaymentInstallment[])
    setLoading(false)
  }

  useEffect(() => {
    fetchInstallments()
  }, [contractId])

  // Marcar como vencidas las cuotas pendientes cuya fecha ya pasó
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    installments.forEach(async (inst) => {
      if (inst.estado === 'pendiente' && inst.fecha_vencimiento < today) {
        await supabase
          .from('payment_installments')
          .update({ estado: 'vencido' })
          .eq('id', inst.id)
      }
    })
  }, [installments])

  const addInstallment = async () => {
    if (!newCuota.monto || !newCuota.fecha_vencimiento) {
      toast.error('Monto y fecha son requeridos')
      return
    }
    const nextNum = installments.length + 1
    const { error } = await supabase.from('payment_installments').insert({
      contract_id: contractId,
      numero_cuota: nextNum,
      descripcion: newCuota.descripcion || `Cuota ${nextNum}`,
      monto: parseFloat(newCuota.monto),
      moneda,
      fecha_vencimiento: newCuota.fecha_vencimiento,
    })
    if (error) {
      toast.error('Error', { description: error.message })
    } else {
      toast.success('Cuota agregada')
      setNewCuota({ descripcion: '', monto: '', fecha_vencimiento: '' })
      setShowForm(false)
      fetchInstallments()
    }
  }

  const markAsPaid = async (id: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('payment_installments')
      .update({ estado: 'pagado', fecha_pago: today })
      .eq('id', id)
    if (!error) {
      toast.success('Marcado como pagado')
      fetchInstallments()
    }
  }

  const deleteInstallment = async (id: string) => {
    const { error } = await supabase.from('payment_installments').delete().eq('id', id)
    if (!error) {
      toast.success('Cuota eliminada')
      fetchInstallments()
    }
  }

  const totalMonto = installments.reduce((sum, i) => sum + Number(i.monto), 0)
  const totalPagado = installments
    .filter((i) => i.estado === 'pagado')
    .reduce((sum, i) => sum + Number(i.monto), 0)
  const totalPendiente = totalMonto - totalPagado

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(val)

  if (loading) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Cronograma de Pagos</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} className="mr-1" /> Agregar Cuota
          </Button>
        </div>
        {installments.length > 0 && (
          <div className="flex gap-4 text-xs mt-2">
            <span>
              Total: <strong>{formatMoney(totalMonto)}</strong>
            </span>
            <span className="text-green-600">
              Pagado: <strong>{formatMoney(totalPagado)}</strong>
            </span>
            <span className="text-orange-600">
              Pendiente: <strong>{formatMoney(totalPendiente)}</strong>
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="border rounded-lg p-3 space-y-3 bg-[hsl(var(--secondary))]">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Descripcion</Label>
                <Input
                  value={newCuota.descripcion}
                  onChange={(e) => setNewCuota((p) => ({ ...p, descripcion: e.target.value }))}
                  placeholder={`Cuota ${installments.length + 1}`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Monto *</Label>
                <Input
                  type="number"
                  value={newCuota.monto}
                  onChange={(e) => setNewCuota((p) => ({ ...p, monto: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fecha vencimiento *</Label>
                <Input
                  type="date"
                  value={newCuota.fecha_vencimiento}
                  onChange={(e) =>
                    setNewCuota((p) => ({ ...p, fecha_vencimiento: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addInstallment}>
                Agregar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {installments.length === 0 ? (
          <p className="text-center py-4 text-sm text-[hsl(var(--muted-foreground))]">
            Sin cuotas programadas
          </p>
        ) : (
          <div className="space-y-2">
            {installments.map((inst) => {
              const config = statusConfig[inst.estado]
              const Icon = config.icon
              return (
                <div key={inst.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={
                        inst.estado === 'pagado'
                          ? 'text-green-600'
                          : inst.estado === 'vencido'
                            ? 'text-red-600'
                            : 'text-gray-400'
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {inst.descripcion || `Cuota ${inst.numero_cuota}`}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Vence:{' '}
                        {new Date(inst.fecha_vencimiento + 'T12:00:00').toLocaleDateString('es-CO')}
                        {inst.fecha_pago &&
                          ` · Pagado: ${new Date(inst.fecha_pago + 'T12:00:00').toLocaleDateString('es-CO')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{formatMoney(Number(inst.monto))}</span>
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {inst.estado === 'pendiente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsPaid(inst.id)}
                        title="Marcar como pagado"
                        aria-label={`Marcar cuota ${inst.numero_cuota} como pagada`}
                      >
                        <Check size={14} />
                      </Button>
                    )}
                    {inst.estado !== 'pagado' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteInstallment(inst.id)}
                        title="Eliminar cuota"
                        aria-label={`Eliminar cuota ${inst.numero_cuota}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
