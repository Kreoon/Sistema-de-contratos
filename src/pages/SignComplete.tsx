import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Shield, Clock, Globe, Download, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Signature } from '@/lib/types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export function SignComplete() {
  const { token } = useParams<{ token: string }>()
  const [signature, setSignature] = useState<Signature | null>(null)
  const [contractTitle, setContractTitle] = useState('')
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null)
  const [checkingPdf, setCheckingPdf] = useState(true)
  const [downloading, setDownloading] = useState(false)

  const downloadPdf = async () => {
    if (!signedPdfUrl || !contractTitle) return
    setDownloading(true)

    try {
      const res = await fetch(signedPdfUrl)
      const htmlText = await res.text()

      // Crear contenedor oculto para renderizar el HTML
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '794px' // Ancho carta en px a 96dpi
      container.style.background = 'white'
      container.innerHTML = htmlText.replace(/<!DOCTYPE[^>]*>|<\/?html[^>]*>|<head>[\s\S]*?<\/head>|<\/?body[^>]*>/gi, '')
      document.body.appendChild(container)

      // Esperar a que las imágenes carguen
      const images = container.querySelectorAll('img')
      await Promise.all(Array.from(images).map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => {
          img.onload = resolve
          img.onerror = resolve
        })
      ))

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      document.body.removeChild(container)

      const imgWidth = 216 // Letter width in mm
      const pageHeight = 279 // Letter height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF('p', 'mm', 'letter')
      let position = 0

      // Multi-página si el contenido es largo
      while (position < imgHeight) {
        if (position > 0) pdf.addPage()
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG', 0, -position, imgWidth, imgHeight
        )
        position += pageHeight
      }

      pdf.save(`${contractTitle.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')}.pdf`)
    } catch (err) {
      console.error('Error generando PDF:', err)
      // Fallback: abrir en nueva pestaña
      window.open(signedPdfUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    if (!token) return

    async function load() {
      const { data: contractData } = await supabase
        .from('contracts')
        .select('id, title, signed_pdf_url')
        .eq('signing_token', token)
        .single()

      if (contractData) {
        setContractTitle(contractData.title)
        setSignedPdfUrl(contractData.signed_pdf_url)

        const { data: sig } = await supabase
          .from('signatures')
          .select('*')
          .eq('contract_id', contractData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (sig) setSignature(sig as Signature)

        // If PDF not ready yet, poll every 3 seconds (max 30 seconds)
        if (!contractData.signed_pdf_url) {
          let attempts = 0
          const interval = setInterval(async () => {
            attempts++
            const { data: updated } = await supabase
              .from('contracts')
              .select('signed_pdf_url')
              .eq('id', contractData.id)
              .single()

            if (updated?.signed_pdf_url) {
              setSignedPdfUrl(updated.signed_pdf_url)
              setCheckingPdf(false)
              clearInterval(interval)
            } else if (attempts >= 10) {
              setCheckingPdf(false)
              clearInterval(interval)
            }
          }, 3000)

          return () => clearInterval(interval)
        } else {
          setCheckingPdf(false)
        }
      } else {
        setCheckingPdf(false)
      }
    }

    load()
  }, [token])

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardContent className="py-12">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">Contrato Firmado Exitosamente</h1>
          <p className="text-[hsl(var(--muted-foreground))]">{contractTitle}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
            Recibirá una copia del contrato firmado en su correo electrónico.
          </p>

          <div className="mt-6">
            {checkingPdf ? (
              <Button disabled variant="outline" size="lg">
                <Loader2 className="animate-spin mr-2" size={16} />
                Preparando documento...
              </Button>
            ) : signedPdfUrl ? (
              <Button
                variant="outline"
                size="lg"
                onClick={downloadPdf}
                disabled={downloading}
              >
                {downloading ? (
                  <><Loader2 className="animate-spin mr-2" size={16} /> Generando PDF...</>
                ) : (
                  <><Download size={16} className="mr-2" /> Descargar Contrato Firmado</>
                )}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {signature && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield size={18} /> Certificado de Firma Electrónica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-[hsl(var(--muted-foreground))]">
              Esta firma electrónica es válida conforme a la Ley 527 de 1999 y el Decreto 2364 de
              2012 de Colombia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[hsl(var(--secondary))] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Clock
                  size={14}
                  className="mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]"
                />
                <div>
                  <p className="font-medium">Fecha y hora</p>
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {new Date(signature.consent_accepted_at).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Globe
                  size={14}
                  className="mt-0.5 shrink-0 text-[hsl(var(--muted-foreground))]"
                />
                <div>
                  <p className="font-medium">Dirección IP</p>
                  <p className="text-[hsl(var(--muted-foreground))]">{signature.ip_address}</p>
                </div>
              </div>

              <div>
                <p className="font-medium">Dispositivo</p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  {signature.device_info?.browser} / {signature.device_info?.os}
                </p>
              </div>

              <div>
                <p className="font-medium">Tipo de firma</p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  {signature.signature_type === 'drawn' ? 'Firma dibujada' : 'Nombre escrito'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Hash del documento (SHA-256)</p>
              <code className="block text-xs bg-[hsl(var(--secondary))] p-2 rounded break-all">
                {signature.document_hash}
              </code>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Hash de la firma (SHA-256)</p>
              <code className="block text-xs bg-[hsl(var(--secondary))] p-2 rounded break-all">
                {signature.signature_hash}
              </code>
            </div>

            <p className="text-xs text-[hsl(var(--muted-foreground))] border-t pt-4">
              {signature.consent_text}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
