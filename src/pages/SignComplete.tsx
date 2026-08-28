import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle,
  Shield,
  Clock,
  Globe,
  Download,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Signature } from "@/lib/types";
import { toast } from "sonner";
import { downloadSignedPdf, isStoredPdf } from "@/lib/pdf";

export function SignComplete() {
  const { token } = useParams<{ token: string }>();
  const [signature, setSignature] = useState<Signature | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [contractTitle, setContractTitle] = useState("");
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
  const [checkingPdf, setCheckingPdf] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!contractId) return;
    setDownloading(true);
    try {
      await downloadSignedPdf(contractId, signedPdfUrl, contractTitle);
      if (!isStoredPdf(signedPdfUrl)) {
        // El PDF acaba de generarse: refrescamos la URL guardada
        const { data } = await supabase.rpc("get_signed_contract_by_token", {
          p_token: token,
        });
        if (data?.[0]?.signed_pdf_url) setSignedPdfUrl(data[0].signed_pdf_url);
      }
    } catch (err) {
      console.error("Error generando PDF:", err);
      toast.error("No se pudo descargar el PDF", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    async function load() {
      // El firmante navega sin sesión y RLS le impide leer contracts/signatures,
      // así que los datos vienen de una función SECURITY DEFINER con el token.
      const { data, error } = await supabase.rpc(
        "get_signed_contract_by_token",
        { p_token: token },
      );

      if (error) console.error("Error cargando el contrato firmado:", error);

      const row = data?.[0];
      if (row) {
        setContractId(row.id);
        setContractTitle(row.title);
        setSignedPdfUrl(row.signed_pdf_url);
        if (row.document_hash) {
          setSignature({
            signature_type: row.signature_type,
            consent_accepted_at: row.consent_accepted_at,
            ip_address: row.ip_address,
            device_info: row.device_info,
            document_hash: row.document_hash,
            signature_hash: row.signature_hash,
            consent_text: row.consent_text,
          } as Signature);
        }
      }
      setCheckingPdf(false);
    }

    load();
  }, [token]);

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardContent className="py-12">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2">
            Contrato Firmado Exitosamente
          </h1>
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
            ) : contractId ? (
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />{" "}
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" /> Descargar Contrato
                    Firmado
                  </>
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
              Esta firma electrónica es válida conforme a la Ley 527 de 1999 y
              el Decreto 2364 de 2012 de Colombia.
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
                    {new Date(signature.consent_accepted_at).toLocaleString(
                      "es-CO",
                    )}
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
                  <p className="text-[hsl(var(--muted-foreground))]">
                    {signature.ip_address}
                  </p>
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
                  {signature.signature_type === "drawn"
                    ? "Firma dibujada"
                    : "Nombre escrito"}
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
  );
}
