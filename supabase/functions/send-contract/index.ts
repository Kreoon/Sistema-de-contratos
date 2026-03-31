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
    const { contractId, signerEmail, signerName, signingUrl, contractTitle } = await req.json()

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY no configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Feria Effix <contratos@effix.co>',
        to: [signerEmail],
        subject: `Contrato pendiente de firma: ${contractTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a2e;">Feria Effix - Firma de Contrato</h2>
            <p>Hola <strong>${signerName}</strong>,</p>
            <p>Tienes un contrato pendiente de firma:</p>
            <p style="font-size: 18px; font-weight: bold; color: #333;">${contractTitle}</p>
            <p>Haz clic en el siguiente enlace para revisar y firmar el contrato electrónicamente:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signingUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Revisar y Firmar Contrato
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Este enlace es único y personal. No lo compartas con terceros.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              Esta firma electrónica es válida conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 de Colombia.
              Al firmar, se registrará su dirección IP, dispositivo y ubicación como parte del audit trail legal.
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

    // Log audit trail
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    await supabase.from('audit_trail').insert({
      contract_id: contractId,
      action: 'email_sent',
      actor_type: 'system',
      actor_email: signerEmail,
      metadata: { email_provider: 'resend', subject: `Contrato pendiente de firma: ${contractTitle}` },
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
