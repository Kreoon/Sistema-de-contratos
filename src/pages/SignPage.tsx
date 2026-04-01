import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, Camera, X, ImageIcon } from 'lucide-react'
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
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null)
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleIdDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes (JPG, PNG, etc.)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no puede superar 10MB')
      return
    }

    setIdDocumentFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setIdDocumentPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeIdDocument = () => {
    setIdDocumentFile(null)
    setIdDocumentPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSign = async () => {
    if (!contract || !signatureData || !signatureData.value || !consentAccepted) {
      toast.error('Complete todos los campos requeridos')
      return
    }

    if (!idDocumentFile) {
      toast.error('Debe adjuntar una foto de su documento de identidad')
      return
    }

    setSigning(true)

    try {
      const metadata = await captureAuditMetadata()
      const documentHash = await sha256(contract.rendered_html ?? '')
      const signatureHash = await sha256(signatureData.value)

      let signatureImageUrl: string | null = null
      let idDocumentImageUrl: string | null = null

      // Subir foto del documento de identidad
      const idFilePath = `${contract.id}/id-${Date.now()}.${idDocumentFile.name.split('.').pop()}`
      const { data: idUpload, error: idUploadError } = await supabase.storage
        .from('signatures')
        .upload(idFilePath, idDocumentFile, { contentType: idDocumentFile.type })

      if (idUploadError) {
        console.warn('No se pudo subir la foto del documento:', idUploadError.message)
      } else {
        const { data: idUrlData } = supabase.storage
          .from('signatures')
          .getPublicUrl(idUpload.path)
        idDocumentImageUrl = idUrlData.publicUrl
      }

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
        p_id_document_image_url: idDocumentImageUrl,
      })

      if (signError) {
        toast.error('Error al firmar', { description: signError.message })
        setSigning(false)
        return
      }

      toast.success('Contrato firmado exitosamente')
      navigate(`/sign/${token}/complete`)

      // Fire-and-forget: generar PDF con certificado (el servidor envía la copia por email automáticamente)
      supabase.functions.invoke('generate-pdf', {
        body: { contractId: contract.id },
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
          {/* Foto del documento de identidad */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Foto del documento de identidad <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Suba una foto clara de su documento de identidad (cédula, pasaporte, etc.) para verificar su identidad.
            </p>

            {idDocumentPreview ? (
              <div className="relative inline-block">
                <img
                  src={idDocumentPreview}
                  alt="Documento de identidad"
                  className="max-h-48 rounded-lg border shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeIdDocument}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-8 text-center cursor-pointer hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))]">
                  <div className="flex gap-2">
                    <Camera size={24} />
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium">Tomar foto o seleccionar imagen</p>
                  <p className="text-xs">JPG, PNG — máximo 10MB</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleIdDocumentSelect}
              className="hidden"
            />
          </div>

          <SignaturePad onSignature={setSignatureData} />
          <SigningConsent accepted={consentAccepted} onAccept={setConsentAccepted} />
          <Button
            onClick={handleSign}
            disabled={signing || !signatureData?.value || !consentAccepted || !idDocumentFile}
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
