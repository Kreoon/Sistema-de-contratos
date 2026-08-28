import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Base64 -> bytes sin dependencias externas (el bundler falla al bajar deno.land). */
function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Nombre de archivo seguro a partir del título del contrato. */
function buildFileName(title: string): string {
  const clean = (title || "contrato")
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${clean || "contrato"}.pdf`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { contractId, pdfBase64, sendCopy } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "contratos" },
    });

    // Fetch contract
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: "Contrato no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = buildFileName(contract.title);

    // ── Modo 2: el cliente ya rasterizó el PDF → lo guardamos en el Storage ──
    if (typeof pdfBase64 === "string" && pdfBase64.length > 0) {
      let pdfBytes: Uint8Array;
      try {
        pdfBytes = decodeBase64(pdfBase64);
      } catch {
        return new Response(JSON.stringify({ error: "PDF inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Un PDF válido siempre empieza con "%PDF"
      const magic = new TextDecoder().decode(pdfBytes.slice(0, 4));
      if (magic !== "%PDF") {
        return new Response(
          JSON.stringify({ error: "El archivo recibido no es un PDF" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const filePath = `signed/${contractId}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("contratos-pdf")
        .upload(filePath, pdfBytes, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        return new Response(
          JSON.stringify({
            error: "Error subiendo el PDF",
            details: uploadError.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const { data: urlData } = supabase.storage
        .from("contratos-pdf")
        .getPublicUrl(filePath);
      // Evita que el CDN sirva una versión anterior tras regenerar el documento
      const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

      await supabase
        .from("contracts")
        .update({ signed_pdf_url: publicUrl, status: "completed" })
        .eq("id", contractId);

      await supabase.from("audit_trail").insert({
        contract_id: contractId,
        action: "downloaded",
        actor_type: "system",
        metadata: {
          file_path: filePath,
          format: "pdf",
          size_bytes: pdfBytes.length,
          has_certificate: true,
        },
      });

      // Borra el HTML de versiones anteriores para no dejar archivos huérfanos
      await supabase.storage
        .from("contratos-pdf")
        .remove([`signed/${contractId}.html`]);

      let emailSent = false;
      let emailError: string | undefined;

      if (sendCopy) {
        try {
          const sendRes = await fetch(
            `${supabaseUrl}/functions/v1/send-signed-copy`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ contractId }),
            },
          );
          if (sendRes.ok) {
            emailSent = true;
          } else {
            emailError = await sendRes.text();
            console.error(
              "send-signed-copy error:",
              sendRes.status,
              emailError,
            );
          }
        } catch (err) {
          emailError = (err as Error).message;
          console.error("Error invocando send-signed-copy:", err);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          url: publicUrl,
          emailSent,
          emailError,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Modo 1: devolvemos el HTML del contrato firmado para que el cliente
    //    lo rasterice y lo convierta en PDF ─────────────────────────────────
    const { data: signature } = await supabase
      .from("signatures")
      .select("*")
      .eq("contract_id", contractId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Build signature image HTML
    let signatureHtml = "";
    if (
      signature?.signature_type === "drawn" &&
      signature.signature_image_url
    ) {
      signatureHtml = `<img src="${signature.signature_image_url}" style="max-height: 80px; max-width: 200px;" alt="Firma electrónica" />`;
    } else if (signature?.signature_type === "typed" && signature.typed_name) {
      signatureHtml = `<span style="font-family: 'Brush Script MT', cursive; font-size: 28px;">${signature.typed_name}</span>`;
    }

    // Replace signature placeholder in contract HTML
    let contractHtml = contract.rendered_html || "";
    contractHtml = contractHtml.replace(
      /\[Firma electrónica\]/g,
      signatureHtml,
    );

    // Inject employer signature (Omar Stevenson Rivera) if not already present
    if (!contractHtml.includes("firma-omar-stevenson")) {
      const employerSigHtml =
        '<img src="/firma-omar-stevenson.png" alt="Firma Omar Stevenson Rivera" style="max-height: 80px; max-width: 200px; margin-bottom: 4px;" />';
      contractHtml = contractHtml.replace(
        /(<div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">\s*<p[^>]*>(?:EL CONTRATANTE|EL CONCEDENTE)<\/p>)/g,
        `${employerSigHtml}\n      $1`,
      );
    }

    // Format date for Colombia timezone
    const signedDate = signature
      ? new Date(signature.consent_accepted_at).toLocaleString("es-CO", {
          timeZone: "America/Bogota",
        })
      : "N/A";

    // Build geolocation string
    const geo = signature?.geolocation;
    const geoString =
      geo?.lat && geo?.lng
        ? `${geo.lat}, ${geo.lng}${geo.city ? ` (${geo.city}, ${geo.country})` : ""}`
        : "No disponible";

    // Build device info string
    const device = signature?.device_info;
    const deviceString = device
      ? `${device.browser || "N/A"} / ${device.os || "N/A"} (${device.device_type || "N/A"})`
      : "N/A";
    const screenString = device?.screen || "N/A";

    // Build certificate HTML
    const certificateHtml = `
      <div style="border-top: 3px solid #1a1a2e; margin-top: 40px; padding-top: 30px;">
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
            ${
              contract.signer_document_id
                ? `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Documento</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${contract.signer_document_id}</td>
            </tr>`
                : ""
            }
            ${
              contract.signer_company
                ? `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Empresa</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${contract.signer_company}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Fecha y hora</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${signedDate} (UTC-5 Colombia)</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6c757d;">Direcci&oacute;n IP</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-family: monospace;">${signature?.ip_address || "N/A"}</td>
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
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${signature?.signature_type === "drawn" ? "Firma dibujada" : "Nombre tipado"}</td>
            </tr>
          </table>

          ${
            signature?.id_document_image_url
              ? `
          <div style="margin: 20px 0; padding: 16px; border: 1px solid #dee2e6; border-radius: 4px; background: white;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px; text-align: center;">DOCUMENTO DE IDENTIDAD</div>
            <div style="text-align: center;">
              <div style="display: inline-block; vertical-align: top; margin: 0 6px;">
                <div style="font-size: 10px; color: #999; margin-bottom: 4px;">Frontal</div>
                <img src="${signature.id_document_image_url}" style="max-height: 200px; max-width: 300px; border-radius: 4px;" alt="Documento de identidad (frontal)" />
              </div>
              ${
                signature?.id_document_back_image_url
                  ? `
              <div style="display: inline-block; vertical-align: top; margin: 0 6px;">
                <div style="font-size: 10px; color: #999; margin-bottom: 4px;">Posterior</div>
                <img src="${signature.id_document_back_image_url}" style="max-height: 200px; max-width: 300px; border-radius: 4px;" alt="Documento de identidad (posterior)" />
              </div>`
                  : ""
              }
            </div>
          </div>`
              : ""
          }

          ${
            signatureHtml
              ? `
          <div style="margin: 20px 0; padding: 16px; border: 1px dashed #dee2e6; border-radius: 4px; text-align: center; background: white;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px;">FIRMA</div>
            ${signatureHtml}
          </div>`
              : ""
          }

          <div style="margin-top: 20px; padding: 16px; background: #e9ecef; border-radius: 4px;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 6px;">HASH DEL DOCUMENTO (SHA-256)</div>
            <code style="font-size: 11px; word-break: break-all; color: #333;">${signature?.document_hash || "N/A"}</code>
          </div>

          <div style="margin-top: 12px; padding: 16px; background: #e9ecef; border-radius: 4px;">
            <div style="font-size: 11px; color: #6c757d; margin-bottom: 6px;">HASH DE LA FIRMA (SHA-256)</div>
            <code style="font-size: 11px; word-break: break-all; color: #333;">${signature?.signature_hash || "N/A"}</code>
          </div>

          <div style="margin-top: 20px; padding: 16px; border: 1px solid #dee2e6; border-radius: 4px; font-size: 12px; color: #6c757d;">
            <strong>Consentimiento otorgado:</strong><br/>
            ${signature?.consent_text || "N/A"}
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #999;">
            Esta firma electr&oacute;nica es v&aacute;lida conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 de Colombia.<br/>
            Documento generado autom&aacute;ticamente por el Sistema de Contratos - Feria Effix.
          </div>
        </div>
      </div>
    `;

    const html = `<div class="contract">${contractHtml}</div>${certificateHtml}`;

    let emailSent = false;
    let emailError: string | undefined;
    if (sendCopy) {
      try {
        const sendRes = await fetch(
          `${supabaseUrl}/functions/v1/send-signed-copy`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ contractId }),
          },
        );
        emailSent = sendRes.ok;
        if (!sendRes.ok) emailError = await sendRes.text();
      } catch (err) {
        emailError = (err as Error).message;
      }
    }

    return new Response(
      JSON.stringify({
        html,
        title: contract.title,
        fileName,
        headerUrl: "/Encabezado.png",
        footerUrl: "/Pie de pagina.png",
        emailSent,
        emailError,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
