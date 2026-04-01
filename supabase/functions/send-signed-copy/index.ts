import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { contractId } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY no configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return new Response(
        JSON.stringify({ error: 'Contrato no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch signature for summary
    const { data: signature } = await supabase
      .from('signatures')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const signedDate = signature
      ? new Date(signature.consent_accepted_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
      : 'N/A'

    const downloadUrl = contract.signed_pdf_url || ''

    // Descargar el HTML firmado para adjuntarlo al email
    let attachments: Array<{ filename: string; content: string }> = []
    if (downloadUrl) {
      try {
        const htmlRes = await fetch(downloadUrl)
        if (htmlRes.ok) {
          const htmlContent = await htmlRes.text()
          // Convertir a base64 para adjuntar en Resend
          const base64Content = btoa(unescape(encodeURIComponent(htmlContent)))
          attachments = [{
            filename: `${contract.title.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')}.html`,
            content: base64Content,
          }]
        }
      } catch (e) {
        console.warn('No se pudo descargar el HTML para adjuntar:', e)
      }
    }

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Feria Effix <onboarding@resend.dev>',
        to: [contract.signer_email],
        subject: `Copia firmada: ${contract.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Feria Effix - Contrato Firmado</h2>
            <p>Hola <strong>${contract.signer_name}</strong>,</p>
            <p>Tu contrato ha sido firmado exitosamente. A continuaci&oacute;n encontrar&aacute;s un resumen y el enlace para descargar tu copia.</p>

            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333; font-size: 16px;">${contract.title}</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #6c757d;">Firmante:</td>
                  <td style="padding: 6px 0; font-weight: bold;">${contract.signer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6c757d;">Fecha de firma:</td>
                  <td style="padding: 6px 0;">${signedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6c757d;">IP registrada:</td>
                  <td style="padding: 6px 0; font-family: monospace;">${signature?.ip_address || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6c757d;">Hash del documento:</td>
                  <td style="padding: 6px 0; font-family: monospace; font-size: 11px; word-break: break-all;">${signature?.document_hash || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <p style="color: #666; font-size: 14px;">
              ${attachments.length > 0
                ? 'Encontrar&aacute; adjunto el documento firmado con el certificado de firma electr&oacute;nica completo (IP, dispositivo, geolocalizaci&oacute;n, hashes SHA-256 y consentimiento). Abra el archivo HTML en su navegador e imprima como PDF para conservarlo.'
                : 'El documento incluye un certificado de firma electr&oacute;nica con todos los datos de verificaci&oacute;n (IP, dispositivo, geolocalizaci&oacute;n, hashes SHA-256 y consentimiento).'}
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              Esta firma electr&oacute;nica es v&aacute;lida conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 de Colombia.
              Conserve este correo como comprobante de su firma.
            </p>
          </div>
        `,
        ...(attachments.length > 0 ? { attachments } : {}),
      }),
    })

    if (!emailRes.ok) {
      const errorData = await emailRes.json()
      return new Response(
        JSON.stringify({ error: 'Error enviando email', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Audit trail
    await supabase.from('audit_trail').insert({
      contract_id: contractId,
      action: 'email_sent',
      actor_type: 'system',
      actor_email: contract.signer_email,
      metadata: {
        type: 'signed_copy',
        email_provider: 'resend',
        subject: `Copia firmada: ${contract.title}`,
      },
    })

    const emailData = await emailRes.json()
    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
