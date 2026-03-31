import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Copy, Send, Download, Clock, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractStatusBadge } from '@/components/contracts/ContractStatusBadge'
import type { Contract, AuditEntry, Signature, ContractStatus } from '@/lib/types'

export function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const [contract, setContract] = useState<Contract | null>(null)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [signature, setSignature] = useState<Signature | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [contractRes, auditRes, sigRes] = await Promise.all([
        supabase
          .from('contracts')
          .select('*, template:contract_templates(name)')
          .eq('id', id)
          .single(),
        supabase
          .from('audit_trail')
          .select('*')
          .eq('contract_id', id)
          .order('created_at', { ascending: true }),
        supabase.from('signatures').select('*').eq('contract_id', id).maybeSingle(),
      ])
      if (contractRes.data) setContract(contractRes.data as Contract)
      if (auditRes.data) setAuditEntries(auditRes.data as AuditEntry[])
      if (sigRes.data) setSignature(sigRes.data as Signature)
      setLoading(false)
    }
    load()
  }, [id])

  const signingUrl = contract ? `${window.location.origin}/sign/${contract.signing_token}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(signingUrl)
    toast.success('Link copiado al portapapeles')
  }

  const markAsSent = async () => {
    if (!contract) return
    const { error } = await supabase
      .from('contracts')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', contract.id)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      await supabase.from('audit_trail').insert({
        contract_id: contract.id,
        action: 'sent',
        actor_type: 'admin',
        actor_email: user?.email,
        metadata: { signer_email: contract.signer_email },
      })
      setContract(prev =>
        prev
          ? { ...prev, status: 'sent' as ContractStatus, sent_at: new Date().toISOString() }
          : null
      )
      toast.success('Contrato marcado como enviado')
    }
  }

  const actionLabels: Record<string, string> = {
    created: 'Contrato creado',
    sent: 'Contrato enviado',
    viewed: 'Contrato visto por firmante',
    signed: 'Contrato firmado',
    downloaded: 'PDF descargado',
    email_sent: 'Email enviado',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    )
  }

  if (!contract) {
    return <div className="text-center py-12">Contrato no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/contracts">
          <Button variant="ghost" size="icon" aria-label="Volver a contratos">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {(contract.template as { name?: string } | undefined)?.name}
          </p>
        </div>
        <ContractStatusBadge status={contract.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: info + acciones */}
        <div className="space-y-6">
          {/* Info del firmante */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Firmante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Nombre: </span>
                {contract.signer_name}
              </div>
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">Email: </span>
                {contract.signer_email}
              </div>
              {contract.signer_document_id && (
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Documento: </span>
                  {contract.signer_document_id}
                </div>
              )}
              {contract.signer_company && (
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Empresa: </span>
                  {contract.signer_company}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Link de firma */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Link de Firma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-[hsl(var(--secondary))] p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap">
                  {signingUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  aria-label="Copiar link de firma"
                >
                  <Copy size={14} />
                </Button>
              </div>
              <div className="flex gap-2">
                {contract.status === 'draft' && (
                  <Button size="sm" onClick={markAsSent}>
                    <Send size={14} className="mr-1" />
                    Marcar Enviado
                  </Button>
                )}
                <a href={signingUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink size={14} className="mr-1" />
                    Abrir
                  </Button>
                </a>
              </div>
              {contract.token_expires_at && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Expira: {new Date(contract.token_expires_at).toLocaleDateString('es-CO')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Firma capturada */}
          {signature && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Firma Capturada</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Tipo: </span>
                  {signature.signature_type === 'drawn' ? 'Dibujada' : 'Tipada'}
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">IP: </span>
                  {signature.ip_address}
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Navegador: </span>
                  {signature.device_info?.browser} / {signature.device_info?.os}
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Hash documento: </span>
                  <code className="text-xs">{signature.document_hash?.slice(0, 16)}...</code>
                </div>
                <div>
                  <span className="text-[hsl(var(--muted-foreground))]">Firmado: </span>
                  {new Date(signature.consent_accepted_at).toLocaleString('es-CO')}
                </div>
                {signature.signature_image_url && (
                  <img
                    src={signature.signature_image_url}
                    alt="Firma del contrato"
                    className="border rounded mt-2 max-h-24"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Audit trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditEntries.map((entry) => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <Clock
                      size={14}
                      className="mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]"
                    />
                    <div>
                      <p className="font-medium">
                        {actionLabels[entry.action] || entry.action}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(entry.created_at).toLocaleString('es-CO')}
                        {entry.actor_email && ` · ${entry.actor_email}`}
                        {entry.ip_address && ` · IP: ${entry.ip_address}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: preview del contrato */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Contrato</CardTitle>
                {contract.signed_pdf_url && (
                  <a href={contract.signed_pdf_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download size={14} className="mr-1" />
                      Descargar PDF
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none border rounded-md p-6 bg-white text-black overflow-auto max-h-[80vh]"
                dangerouslySetInnerHTML={{ __html: contract.rendered_html || '' }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
