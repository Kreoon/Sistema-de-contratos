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
    const { contractId, html, signatureImageUrl } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // For now, store the HTML as a downloadable file
    // In production, integrate with a PDF generation service (e.g., Puppeteer, wkhtmltopdf API)
    // or use pdf-lib for programmatic PDF creation

    // Replace signature placeholder with actual signature image
    let finalHtml = html
    if (signatureImageUrl) {
      finalHtml = html.replace(
        /\[Firma electrónica\]/g,
        `<img src="${signatureImageUrl}" style="max-height: 80px; max-width: 200px;" alt="Firma electrónica" />`
      )
    }

    // Wrap in full HTML document for PDF rendering
    const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 2cm; size: letter; }
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; }
    .contract { max-width: 100%; }
  </style>
</head>
<body>${finalHtml}</body>
</html>`

    // Upload HTML version as PDF placeholder
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

    // Update contract with PDF URL
    await supabase.from('contracts').update({
      signed_pdf_url: urlData.publicUrl,
      status: 'completed',
    }).eq('id', contractId)

    // Audit trail
    await supabase.from('audit_trail').insert({
      contract_id: contractId,
      action: 'downloaded',
      actor_type: 'system',
      metadata: { file_path: filePath, format: 'html' },
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
