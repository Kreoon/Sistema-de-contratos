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
    const siteUrl = Deno.env.get('SITE_URL') || 'https://sistema-de-contratos-two.vercel.app'

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

    // Build device info for email
    const deviceStr = signature?.device_info
      ? `${signature.device_info.browser || ''} / ${signature.device_info.os || ''} (${signature.device_info.device_type || ''})`
      : 'N/A'

    const geoStr = signature?.geolocation?.lat
      ? `${signature.geolocation.lat}, ${signature.geolocation.lng}${signature.geolocation.city ? ` (${signature.geolocation.city}, ${signature.geolocation.country})` : ''}`
      : 'No disponible'

    // Send email via Resend — email limpio sin adjunto HTML
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Feria Effix <noreply@contratos.feriaeffix.com>',
        to: [contract.signer_email],
        subject: `Contrato firmado: ${contract.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 24px 0; border-bottom: 2px solid #1a1a2e;">
              <h1 style="color: #1a1a2e; font-size: 22px; margin: 0;">Feria Effix</h1>
              <p style="color: #6c757d; font-size: 13px; margin: 4px 0 0 0;">Sistema de Contratos Electr&oacute;nicos</p>
            </div>

            <div style="padding: 24px 0;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: #dcfce7; border-radius: 50%; padding: 12px; margin-bottom: 12px;">
                  <span style="font-size: 28px;">&#10003;</span>
                </div>
                <h2 style="color: #16a34a; font-size: 20px; margin: 0;">Contrato Firmado Exitosamente</h2>
              </div>

              <p>Hola <strong>${contract.signer_name}</strong>,</p>
              <p>Tu contrato ha sido firmado y registrado correctamente. A continuaci&oacute;n encontrar&aacute;s el resumen completo de la firma.</p>

              <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1a1a2e; font-size: 16px; border-bottom: 1px solid #dee2e6; padding-bottom: 12px;">${contract.title}</h3>
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6c757d; width: 140px;">Firmante:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${contract.signer_name}</td>
                  </tr>
                  ${contract.signer_document_id ? `<tr>
                    <td style="padding: 8px 0; color: #6c757d;">Documento:</td>
                    <td style="padding: 8px 0;">${contract.signer_document_id}</td>
                  </tr>` : ''}
                  ${contract.signer_company ? `<tr>
                    <td style="padding: 8px 0; color: #6c757d;">Empresa:</td>
                    <td style="padding: 8px 0;">${contract.signer_company}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #6c757d;">Email:</td>
                    <td style="padding: 8px 0;">${contract.signer_email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6c757d;">Fecha de firma:</td>
                    <td style="padding: 8px 0; font-weight: bold;">${signedDate}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #1a1a2e; font-size: 14px;">Certificado de Firma Electr&oacute;nica</h4>
                <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #6c757d; width: 140px;">Direcci&oacute;n IP:</td>
                    <td style="padding: 6px 0; font-family: monospace;">${signature?.ip_address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6c757d;">Dispositivo:</td>
                    <td style="padding: 6px 0;">${deviceStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6c757d;">Pantalla:</td>
                    <td style="padding: 6px 0;">${signature?.device_info?.screen || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6c757d;">Geolocalizaci&oacute;n:</td>
                    <td style="padding: 6px 0;">${geoStr}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6c757d;">Tipo de firma:</td>
                    <td style="padding: 6px 0;">${signature?.signature_type === 'drawn' ? 'Firma dibujada' : 'Nombre tipado'}</td>
                  </tr>
                </table>

                <div style="margin-top: 16px; padding: 12px; background: #f1f3f5; border-radius: 4px;">
                  <p style="font-size: 11px; color: #6c757d; margin: 0 0 4px 0;">Hash del documento (SHA-256):</p>
                  <code style="font-size: 10px; word-break: break-all; color: #333;">${signature?.document_hash || 'N/A'}</code>
                </div>
                <div style="margin-top: 8px; padding: 12px; background: #f1f3f5; border-radius: 4px;">
                  <p style="font-size: 11px; color: #6c757d; margin: 0 0 4px 0;">Hash de la firma (SHA-256):</p>
                  <code style="font-size: 10px; word-break: break-all; color: #333;">${signature?.signature_hash || 'N/A'}</code>
                </div>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${siteUrl}/sign/${contract.signing_token}/complete"
                   style="background-color: #1a1a2e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
                  Ver Contrato Firmado
                </a>
              </div>

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #1e40af;">
                  <strong>Conserve este correo como comprobante legal de su firma.</strong>
                </p>
                <p style="margin: 0; font-size: 12px; color: #3b82f6;">
                  Este email contiene toda la informaci&oacute;n necesaria para verificar la autenticidad de su firma.
                </p>
              </div>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 11px; text-align: center;">
              Firma electr&oacute;nica v&aacute;lida conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 de Colombia.<br/>
              Documento generado por el Sistema de Contratos - Feria Effix.
            </p>
          </div>
        `,
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
        subject: `Contrato firmado: ${contract.title}`,
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
