import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { sha256 } from '@/lib/hashing'
import { captureAuditMetadata } from '@/lib/audit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignaturePad } from '@/components/signing/SignaturePad'
import { SigningConsent, CONSENT_TEXT } from '@/components/signing/SigningConsent'
import type { Contract } from '@/lib/types'

interface SignatureState {
  type: 'drawn' | 'typed'
  value: string
}

export function SignPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState<SignatureState | null>(null)
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    if (!token) return

    async function loadContract() {
      const { data, error: rpcError } = await supabase.rpc('get_contract_by_token', {
        p_token: token,
      })

      if (rpcError || !data || data.length === 0) {
        setError('Este enlace de firma no es válido, ya fue utilizado o ha expirado.')
        setLoading(false)
        return
      }

      const contractData = data[0] as Contract
      setContract(contractData)

      // Registrar visualización del contrato
      const metadata = await captureAuditMetadata()
      await supabase.rpc('mark_contract_viewed', {
        p_token: token,
        p_ip_address: metadata.ip_address,
        p_user_agent: metadata.user_agent,
      })

      setLoading(false)
    }

    loadContract()
  }, [token])

  const handleSign = async () => {
    if (!contract || !signatureData || !signatureData.value || !consentAccepted) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    setSigning(true)

    try {
      const metadata = await captureAuditMetadata()
      const documentHash = await sha256(contract.rendered_html ?? '')
      const signatureHash = await sha256(signatureData.value)

      let signatureImageUrl: string | null = null

      // Subir imagen de firma dibujada al storage
      if (signatureData.type === 'drawn') {
        const base64 = signatureData.value.split(',')[1]
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })

        const filePath = `${contract.id}/${Date.now()}.png`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('signatures')
          .upload(filePath, blob, { contentType: 'image/png' })

        if (uploadError) {
          // El bucket puede no existir aún — se continúa sin URL de imagen
          console.warn('No se pudo subir la imagen de firma:', uploadError.message)
        } else {
          const { data: urlData } = supabase.storage
            .from('signatures')
            .getPublicUrl(uploadData.path)
          signatureImageUrl = urlData.publicUrl
        }
      }

      // Llamar a la función de firma
      const { error: signError } = await supabase.rpc('sign_contract', {
        p_token: token,
        p_signature_type: signatureData.type,
        p_signature_image_url: signatureImageUrl,
        p_typed_name: signatureData.type === 'typed' ? signatureData.value : null,
        p_document_hash: documentHash,
        p_signature_hash: signatureHash,
        p_ip_address: metadata.ip_address,
        p_user_agent: metadata.user_agent,
        p_geolocation: metadata.geolocation,
        p_device_info: metadata.device_info,
        p_consent_text: CONSENT_TEXT,
      })

      if (signError) {
        toast.error('Error al firmar', { description: signError.message })
        setSigning(false)
        return
      }

      toast.success('Contrato firmado exitosamente')
      navigate(`/sign/${token}/complete`)

      // Fire-and-forget: generar PDF con certificado y enviar copia por email
      supabase.functions.invoke('generate-pdf', {
        body: { contractId: contract.id },
      }).then((res) => {
        if (!res.error) {
          // PDF generado, ahora enviar copia al firmante
          supabase.functions.invoke('send-signed-copy', {
            body: { contractId: contract.id },
          })
        }
      })
    } catch (err) {
      toast.error('Error inesperado al firmar')
      console.error(err)
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin mr-2" /> Cargando contrato...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <AlertTriangle size={48} className="mx-auto mb-4 text-[hsl(var(--destructive))]" />
          <h2 className="text-xl font-bold mb-2">Enlace no válido</h2>
          <p className="text-[hsl(var(--muted-foreground))]">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!contract) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{contract.title}</CardTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Para: {contract.signer_name} ({contract.signer_email})
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none border rounded-md p-6 bg-white text-black overflow-auto max-h-[60vh]"
            dangerouslySetInnerHTML={{ __html: contract.rendered_html ?? '' }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Firmar Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SignaturePad onSignature={setSignatureData} />
          <SigningConsent accepted={consentAccepted} onAccept={setConsentAccepted} />
          <Button
            onClick={handleSign}
            disabled={signing || !signatureData?.value || !consentAccepted}
            className="w-full"
            size="lg"
          >
            {signing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} /> Firmando...
              </>
            ) : (
              'Firmar Contrato'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
