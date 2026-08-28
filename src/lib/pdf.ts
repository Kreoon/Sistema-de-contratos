import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "./supabase";

// Medidas de página A4 en milímetros
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 8;
const GAP = 4;

// Ancho en píxeles con el que se renderiza el HTML antes de rasterizarlo.
// Cuanto mayor, más nítido el resultado (y más pesado el archivo).
const RENDER_WIDTH_PX = 780;
const CONTENT_WIDTH_MM = PAGE_WIDTH - MARGIN_X * 2;

export interface SignedContractPayload {
  html: string;
  title: string;
  fileName: string;
  headerUrl: string | null;
  footerUrl: string | null;
}

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Invoca una Edge Function propagando el cuerpo del error del servidor.
 * `functions.invoke` solo entrega "Edge Function returned a non-2xx status code",
 * lo que oculta la causa real; aquí leemos el JSON de la respuesta.
 */
export async function invokeFunction<T = unknown>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return data as T;

  let detail = error.message;
  const context = (error as { context?: Response }).context;
  if (context && typeof context.json === "function") {
    try {
      const parsed = await context.json();
      if (parsed?.error) detail = parsed.error;
      if (parsed?.details) {
        detail += `: ${
          typeof parsed.details === "string"
            ? parsed.details
            : JSON.stringify(parsed.details)
        }`;
      }
    } catch {
      // La respuesta no era JSON: nos quedamos con el mensaje original
    }
  }
  throw new Error(detail);
}

/** Descarga una imagen del mismo origen y la convierte a data URL para jsPDF. */
async function loadImage(url: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const size = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = dataUrl;
      },
    );
    return { dataUrl, ...size };
  } catch {
    return null;
  }
}

/** Espera a que todas las imágenes del contenedor terminen de cargar. */
async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      // Las imágenes del Storage son de otro origen: sin crossOrigin, html2canvas
      // "tiñe" el canvas y toDataURL falla.
      if (!img.src.startsWith(window.location.origin) && !img.crossOrigin) {
        const source = img.src;
        img.crossOrigin = "anonymous";
        // Reasignar el src fuerza una nueva petición, esta vez con CORS
        img.setAttribute("src", source);
      }
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );
  // Una pausa para que el layout se estabilice antes de rasterizar. Se usa
  // setTimeout y no requestAnimationFrame porque Chrome congela los frames en
  // pestañas de segundo plano: si el firmante cambia de pestaña mientras se
  // prepara su PDF, la generación quedaría colgada para siempre.
  await new Promise((resolve) => setTimeout(resolve, 60));
}

/**
 * Busca hacia arriba una franja horizontal en blanco para cortar la página sin
 * partir una línea de texto por la mitad.
 */
function findPageBreak(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  idealBreak: number,
  minBreak: number,
): number {
  const searchLimit = Math.max(minBreak, idealBreak - 120);
  const sampleStep = Math.max(1, Math.floor(canvasWidth / 120));

  for (let y = idealBreak; y > searchLimit; y--) {
    const row = ctx.getImageData(0, y, canvasWidth, 1).data;
    let blank = true;
    for (let x = 0; x < canvasWidth; x += sampleStep) {
      const i = x * 4;
      // Consideramos "en blanco" cualquier píxel casi blanco o transparente
      if (
        row[i + 3] > 12 &&
        (row[i] < 245 || row[i + 1] < 245 || row[i + 2] < 245)
      ) {
        blank = false;
        break;
      }
    }
    if (blank) return y;
  }
  return idealBreak;
}

/**
 * Rasteriza el HTML del contrato firmado y arma un PDF A4 multipágina con el
 * encabezado y el pie de página repetidos en todas las hojas.
 */
export async function renderContractPdf(
  payload: SignedContractPayload,
): Promise<jsPDF> {
  const [header, footer] = await Promise.all([
    payload.headerUrl ? loadImage(payload.headerUrl) : Promise.resolve(null),
    payload.footerUrl ? loadImage(payload.footerUrl) : Promise.resolve(null),
  ]);

  const headerHeight = header
    ? (header.height * CONTENT_WIDTH_MM) / header.width
    : 0;
  const footerHeight = footer
    ? (footer.height * CONTENT_WIDTH_MM) / footer.width
    : 0;

  const contentTop = MARGIN_TOP + (header ? headerHeight + GAP : 0);
  const contentBottom =
    PAGE_HEIGHT - MARGIN_BOTTOM - (footer ? footerHeight + GAP : 0);
  const contentHeightMm = contentBottom - contentTop;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${RENDER_WIDTH_PX}px`;
  container.style.background = "#ffffff";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.fontFamily = "Georgia, 'Times New Roman', serif";
  container.style.fontSize = "13px";
  container.style.lineHeight = "1.6";
  container.style.color = "#333333";
  container.innerHTML = payload.html;
  document.body.appendChild(container);

  try {
    await waitForImages(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: RENDER_WIDTH_PX,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "p" });
    const pxPerMm = canvas.width / CONTENT_WIDTH_MM;
    const sliceHeightPx = Math.floor(contentHeightMm * pxPerMm);

    const sourceCtx = canvas.getContext("2d", { willReadFrequently: true });
    const sliceCanvas = document.createElement("canvas");
    const sliceCtx = sliceCanvas.getContext("2d")!;

    let offset = 0;
    let pageIndex = 0;

    while (offset < canvas.height) {
      let end = Math.min(offset + sliceHeightPx, canvas.height);
      // Solo buscamos un corte limpio si aún queda contenido por debajo
      if (end < canvas.height && sourceCtx) {
        end = findPageBreak(
          sourceCtx,
          canvas.width,
          end,
          offset + Math.floor(sliceHeightPx * 0.5),
        );
      }
      const sliceHeight = end - offset;
      if (sliceHeight <= 0) break;

      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      sliceCtx.fillStyle = "#ffffff";
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceCtx.drawImage(
        canvas,
        0,
        offset,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      if (pageIndex > 0) pdf.addPage();

      if (header) {
        pdf.addImage(
          header.dataUrl,
          "PNG",
          MARGIN_X,
          MARGIN_TOP,
          CONTENT_WIDTH_MM,
          headerHeight,
        );
      }
      if (footer) {
        pdf.addImage(
          footer.dataUrl,
          "PNG",
          MARGIN_X,
          PAGE_HEIGHT - MARGIN_BOTTOM - footerHeight,
          CONTENT_WIDTH_MM,
          footerHeight,
        );
      }

      pdf.addImage(
        sliceCanvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        MARGIN_X,
        contentTop,
        CONTENT_WIDTH_MM,
        sliceHeight / pxPerMm,
        undefined,
        "FAST",
      );

      offset = end;
      pageIndex++;
    }

    return pdf;
  } finally {
    document.body.removeChild(container);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface GenerateOptions {
  /** Descarga el PDF en el navegador además de guardarlo en el Storage. */
  download?: boolean;
  /** Pide al servidor que envíe la copia firmada por email tras guardar el PDF. */
  sendCopy?: boolean;
}

export interface GenerateResult {
  url: string;
  fileName: string;
  emailSent: boolean;
  emailError?: string;
}

/**
 * Genera el PDF firmado (contrato + certificado), lo sube al Storage a través de
 * la Edge Function `generate-pdf` y opcionalmente lo descarga y dispara el email.
 */
export async function generateAndStoreSignedPdf(
  contractId: string,
  options: GenerateOptions = {},
): Promise<GenerateResult> {
  const payload = await invokeFunction<SignedContractPayload>("generate-pdf", {
    contractId,
  });

  if (!payload?.html) {
    throw new Error(
      "La Edge Function generate-pdf no devolvió el contenido del contrato. Verifica que esté desplegada su última versión.",
    );
  }

  const pdf = await renderContractPdf(payload);
  const blob = pdf.output("blob") as Blob;
  const pdfBase64 = await blobToBase64(blob);

  const stored = await invokeFunction<{
    url: string;
    emailSent?: boolean;
    emailError?: string;
  }>("generate-pdf", {
    contractId,
    pdfBase64,
    sendCopy: options.sendCopy ?? false,
  });

  if (options.download) triggerDownload(blob, payload.fileName);

  return {
    url: stored.url,
    fileName: payload.fileName,
    emailSent: !!stored.emailSent,
    emailError: stored.emailError,
  };
}

/**
 * Indica si la URL guardada apunta a un PDF real. Los contratos anteriores
 * guardaban un `.html`, que el navegador abría en vez de descargar.
 */
export function isStoredPdf(storedUrl: string | null | undefined): boolean {
  if (!storedUrl) return false;
  try {
    return new URL(storedUrl).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return storedUrl.split("?")[0].toLowerCase().endsWith(".pdf");
  }
}

/** Nombre de archivo legible a partir del título del contrato. */
export function buildFileName(title: string | null | undefined): string {
  const clean = (title || "contrato")
    .normalize("NFD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${clean || "contrato"}.pdf`;
}

/** Descarga el PDF ya almacenado; si no existe o es un HTML antiguo, lo regenera. */
export async function downloadSignedPdf(
  contractId: string,
  storedUrl: string | null,
  title?: string | null,
): Promise<void> {
  if (isStoredPdf(storedUrl)) {
    try {
      const res = await fetch(storedUrl!, { cache: "no-store" });
      if (res.ok) {
        const blob = await res.blob();
        triggerDownload(blob, buildFileName(title));
        return;
      }
    } catch {
      // Si falla la descarga directa (CORS, archivo borrado), regeneramos abajo
    }
  }
  await generateAndStoreSignedPdf(contractId, { download: true });
}
