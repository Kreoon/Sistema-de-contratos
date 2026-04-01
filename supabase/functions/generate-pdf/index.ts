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

    // Fetch signature
    const { data: signature } = await supabase
      .from('signatures')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Build signature image HTML
    let signatureHtml = ''
    if (signature?.signature_type === 'drawn' && signature.signature_image_url) {
      signatureHtml = `<img src="${signature.signature_image_url}" style="max-height: 80px; max-width: 200px;" alt="Firma electrónica" />`
    } else if (signature?.signature_type === 'typed' && signature.typed_name) {
      signatureHtml = `<span style="font-family: 'Brush Script MT', cursive; font-size: 28px;">${signature.typed_name}</span>`
    }

    // Replace signature placeholder in contract HTML
    let contractHtml = contract.rendered_html || ''
    contractHtml = contractHtml.replace(
      /\[Firma electrónica\]/g,
      signatureHtml
    )

    // Format date for Colombia timezone
    const signedDate = signature
      ? new Date(signature.consent_accepted_at).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
      : 'N/A'

    // Build geolocation string
    const geo = signature?.geolocation
    const geoString = geo?.lat && geo?.lng
      ? `${geo.lat}, ${geo.lng}${geo.city ? ` (${geo.city}, ${geo.country})` : ''}`
      : 'No disponible'

    // Build device info string
    const device = signature?.device_info
    const deviceString = device
      ? `${device.browser || 'N/A'} / ${device.os || 'N/A'} (${device.device_type || 'N/A'})`
      : 'N/A'
    const screenString = device?.screen || 'N/A'

    // Build certificate HTML
    const certificateHtml = `
      <div style="page-break-before: always; border-top: 3px solid #1a1a2e; margin-top: 40px; padding-top: 30px;">
        <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 30px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #6c757d; letter-spacing: 2px; text-transform: uppercase;">Certificado de</div>
            <h2 style="margin: 4px 0; color: #1a1a2e; font-size: 22px;">Firma Electr&oacute;nica</h2>
            <div style="width: 60px; height: 3px; background: #3b82f6; margin: 8px auto;"></div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d; width: 180px;">Firmante</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold;">${contract.signer_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Email</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${contract.signer_email}</td>
            </tr>
            ${contract.signer_document_id ? `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Documento</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${contract.signer_document_id}</td>
            </tr>` : ''}
            ${contract.signer_company ? `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Empresa</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${contract.signer_company}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Fecha y hora</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${signedDate} (UTC-5 Colombia)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Direcci&oacute;n IP</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-family: monospace;">${signature?.ip_address || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Dispositivo</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${deviceString}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Resoluci&oacute;n</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${screenString}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Geolocalizaci&oacute;n</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${geoString}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Tipo de firma</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${signature?.signature_type === 'drawn' ? 'Firma dibujada' : 'Nombre tipado'}</td>
            </tr>
          </table>

          ${signatureHtml ? `
          <div style="margin: 20px 0; padding: 16px; border: 1px dashed #dee2e6; border-radius: 4px; text-align: center; background: white;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px;">FIRMA</div>
            ${signatureHtml}
          </div>` : ''}

          <div style="margin-top: 20px; padding: 16px; background: #e9ecef; border-radius: 4px;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 6px;">HASH DEL DOCUMENTO (SHA-256)</div>
            <code style="font-size: 11px; word-break: break-all; color: #333;">${signature?.document_hash || 'N/A'}</code>
          </div>

          <div style="margin-top: 12px; padding: 16px; background: #e9ecef; border-radius: 4px;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 6px;">HASH DE LA FIRMA (SHA-256)</div>
            <code style="font-size: 11px; word-break: break-all; color: #333;">${signature?.signature_hash || 'N/A'}</code>
          </div>

          <div style="margin-top: 20px; padding: 16px; border: 1px solid #dee2e6; border-radius: 4px; font-size: 12px; color: #6c757d;">
            <strong>Consentimiento otorgado:</strong><br/>
            ${signature?.consent_text || 'N/A'}
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #999;">
            Esta firma electr&oacute;nica es v&aacute;lida conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 de Colombia.<br/>
            Documento generado autom&aacute;ticamente por el Sistema de Contratos - Feria Effix.
          </div>
        </div>
      </div>
    `

    // Build full HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 2cm; size: letter; }
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .contract { max-width: 100%; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="contract">${contractHtml}</div>
  ${certificateHtml}
</body>
</html>`

    // Upload to Storage
    const filePath = `signed/${contractId}.html`
    const { error: uploadError } = await supabase.storage
      .from('contracts-pdf')
      .upload(filePath, new Blob([fullHtml], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: true,
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Error subiendo archivo', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: urlData } = supabase.storage.from('contracts-pdf').getPublicUrl(filePath)

    // Update contract with PDF URL and mark as completed
    await supabase.from('contracts').update({
      signed_pdf_url: urlData.publicUrl,
      status: 'completed',
    }).eq('id', contractId)

    // Audit trail
    await supabase.from('audit_trail').insert({
      contract_id: contractId,
      action: 'downloaded',
      actor_type: 'system',
      metadata: { file_path: filePath, format: 'html', has_certificate: true },
    })

    return new Response(
      JSON.stringify({ success: true, url: urlData.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
