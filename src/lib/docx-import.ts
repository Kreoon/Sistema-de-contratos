import type { TemplateVariable } from "./types";

/**
 * Importación de plantillas de contrato desde archivos .docx.
 *
 * El flujo es: Word -> HTML (mammoth) -> normalización al estilo visual de las
 * plantillas existentes -> detección de marcadores ([NOMBRE], ____, xxxx) ->
 * sustitución por variables Handlebars ({{nombre_completo}}) -> guardado en
 * `contract_templates`.
 */

// ================================================
// Catálogo de variables que el sistema ya sabe llenar
// ================================================

export type VariableSource =
  | "organizador"
  | "contacto"
  | "pago"
  | "stand"
  | "evento"
  | "patrocinio"
  | "manual";

export interface KnownVariable {
  key: string;
  label: string;
  type: TemplateVariable["type"];
  source: VariableSource;
  /** Palabras con las que se reconoce este campo en un marcador del .docx */
  aliases: string[];
  /** Opciones fijas, para los campos de tipo select */
  options?: string[];
  /**
   * Obligatoriedad por defecto. Los campos de identidad son opcionales porque
   * dependen de si la contraparte es persona natural o jurídica.
   */
  defaultRequired?: boolean;
}

/** Qué significa cada origen, para explicarlo en la interfaz. */
export const SOURCE_INFO: Record<
  VariableSource,
  { label: string; description: string }
> = {
  organizador: {
    label: "Automático",
    description: "Se completa solo con los datos de EFFIX S.A.S.",
  },
  contacto: {
    label: "Contacto",
    description: "Se completa al elegir el contacto en el CRM",
  },
  pago: {
    label: "Pago",
    description: "Se completa en la sección Valor y Forma de Pago",
  },
  stand: {
    label: "Stand",
    description: "Se completa en la sección Tipo de Stand",
  },
  evento: {
    label: "Evento",
    description: "Se completa al elegir el año del evento",
  },
  patrocinio: {
    label: "Patrocinio",
    description: "Se completa al elegir el tipo de patrocinio",
  },
  manual: {
    label: "Manual",
    description: "Se escribe a mano al crear cada contrato",
  },
};

export const KNOWN_VARIABLES: KnownVariable[] = [
  // --- Organizador (EFFIX). Se inyectan siempre, no se piden al usuario ---
  {
    key: "org_empresa",
    label: "Empresa organizadora",
    type: "text",
    source: "organizador",
    aliases: ["effix", "empresa organizadora", "contratante"],
  },
  {
    key: "org_nit",
    label: "NIT del organizador",
    type: "text",
    source: "organizador",
    aliases: ["nit effix", "nit organizador"],
  },
  {
    key: "org_nombre",
    label: "Representante legal del organizador",
    type: "text",
    source: "organizador",
    aliases: ["omar stevenson", "representante legal effix"],
  },
  {
    key: "org_documento",
    label: "Documento del representante del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_documento_tipo",
    label: "Tipo de documento del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_direccion",
    label: "Dirección del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_ciudad",
    label: "Ciudad del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_departamento",
    label: "Departamento del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_pais",
    label: "País del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_email",
    label: "Correo del organizador",
    type: "email",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_telefono",
    label: "Teléfono del organizador",
    type: "text",
    source: "organizador",
    aliases: [],
  },
  {
    key: "org_lugar_evento",
    label: "Lugar del evento",
    type: "text",
    source: "organizador",
    aliases: ["plaza mayor", "lugar del evento", "sede"],
  },

  // --- Contraparte: se completa desde el CRM ---
  {
    key: "tipo_persona",
    label: "Tipo de persona",
    type: "select",
    source: "contacto",
    aliases: ["tipo de persona"],
    options: ["Persona Natural", "Persona Jurídica"],
  },
  {
    key: "nombre_completo",
    label: "Nombre completo (persona natural)",
    type: "text",
    source: "contacto",
    aliases: [
      "nombre completo",
      "nombre",
      "nombres y apellidos",
      "contratista",
    ],
    defaultRequired: false,
  },
  {
    key: "tipo_documento",
    label: "Tipo de documento (persona natural)",
    type: "select",
    source: "contacto",
    aliases: ["tipo de documento", "tipo documento"],
    options: ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"],
    defaultRequired: false,
  },
  {
    key: "numero_documento",
    label: "Número de documento (persona natural)",
    type: "text",
    source: "contacto",
    aliases: [
      "numero",
      "numero de documento",
      "cedula",
      "cedula de ciudadania",
      "documento",
      "identificacion",
      "cc",
    ],
    defaultRequired: false,
  },
  {
    key: "empresa",
    label: "Razón social (persona jurídica)",
    type: "text",
    source: "contacto",
    aliases: ["empresa", "razon social", "compania"],
    defaultRequired: false,
  },
  {
    key: "id_fiscal",
    label: "ID fiscal / NIT (persona jurídica)",
    type: "text",
    source: "contacto",
    aliases: ["nit", "id fiscal", "rut", "identificacion fiscal"],
    defaultRequired: false,
  },
  {
    key: "sigla",
    label: "Sigla",
    type: "text",
    source: "contacto",
    aliases: ["sigla"],
    defaultRequired: false,
  },
  {
    key: "representante_legal",
    label: "Nombre del representante legal",
    type: "text",
    source: "contacto",
    aliases: ["representante legal", "representante"],
    defaultRequired: false,
  },
  {
    key: "tipo_documento_representante",
    label: "Tipo de documento del representante",
    type: "select",
    source: "contacto",
    aliases: ["tipo de documento del representante"],
    options: ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"],
    defaultRequired: false,
  },
  {
    key: "numero_documento_representante",
    label: "Documento del representante",
    type: "text",
    source: "contacto",
    aliases: ["documento del representante", "cedula del representante"],
    defaultRequired: false,
  },
  {
    key: "email",
    label: "Correo electrónico",
    type: "email",
    source: "contacto",
    aliases: ["email", "correo", "correo electronico", "e-mail"],
  },
  {
    key: "email_contratista",
    label: "Correo del contratista",
    type: "email",
    source: "contacto",
    aliases: ["correo del contratista", "email contratista"],
  },
  {
    key: "telefono",
    label: "Teléfono",
    type: "text",
    source: "contacto",
    aliases: ["telefono", "tel"],
  },
  {
    key: "telefono_contratista",
    label: "Teléfono del contratista",
    type: "text",
    source: "contacto",
    aliases: ["telefono del contratista"],
  },
  {
    key: "celular",
    label: "Celular",
    type: "text",
    source: "contacto",
    aliases: ["celular", "movil", "whatsapp"],
  },
  {
    key: "direccion",
    label: "Dirección",
    type: "text",
    source: "contacto",
    aliases: ["direccion"],
  },
  {
    key: "ciudad",
    label: "Ciudad",
    type: "text",
    source: "contacto",
    aliases: ["ciudad"],
  },
  {
    key: "departamento",
    label: "Departamento",
    type: "text",
    source: "contacto",
    aliases: ["departamento"],
  },
  {
    key: "pais",
    label: "País",
    type: "text",
    source: "contacto",
    aliases: ["pais", "nacionalidad"],
  },
  {
    key: "web_redes",
    label: "Web / redes sociales",
    type: "text",
    source: "contacto",
    aliases: ["web", "redes", "redes sociales", "sitio web"],
  },
  {
    key: "persona_encargada",
    label: "Persona encargada",
    type: "text",
    source: "contacto",
    aliases: ["persona encargada", "contacto encargado"],
  },
  {
    key: "email_encargada",
    label: "Correo de la persona encargada",
    type: "email",
    source: "contacto",
    aliases: ["correo encargada"],
  },
  {
    key: "celular_encargada",
    label: "Celular de la persona encargada",
    type: "text",
    source: "contacto",
    aliases: ["celular encargada"],
  },

  // --- Evento ---
  {
    key: "anio",
    label: "Año del evento",
    type: "text",
    source: "evento",
    aliases: ["ano", "anio", "año", "vigencia"],
  },

  // --- Valor y forma de pago ---
  {
    key: "valor_total",
    label: "Valor total",
    type: "text",
    source: "pago",
    aliases: ["valor total", "valor", "total", "precio"],
  },
  {
    key: "valor_abono",
    label: "Valor del abono",
    type: "text",
    source: "pago",
    aliases: ["abono", "anticipo"],
  },
  {
    key: "moneda",
    label: "Moneda",
    type: "select",
    source: "pago",
    aliases: ["moneda", "divisa"],
    options: ["COP", "USD", "EUR"],
  },
  {
    key: "forma_pago",
    label: "Forma de pago",
    type: "textarea",
    source: "pago",
    aliases: ["forma de pago", "forma pago", "cuotas"],
  },
  {
    key: "honorarios",
    label: "Honorarios",
    type: "text",
    source: "pago",
    aliases: ["honorarios"],
  },
  {
    key: "honorarios_letras",
    label: "Honorarios en letras",
    type: "text",
    source: "pago",
    aliases: ["honorarios en letras"],
  },
  {
    key: "valor_stand",
    label: "Valor del stand",
    type: "text",
    source: "pago",
    aliases: ["valor del stand"],
  },
  {
    key: "valor_stand_letras",
    label: "Valor del stand en letras",
    type: "text",
    source: "pago",
    aliases: ["valor del stand en letras"],
  },
  {
    key: "valor_patrocinio",
    label: "Valor del patrocinio",
    type: "text",
    source: "pago",
    aliases: ["valor del patrocinio"],
  },
  {
    key: "valor_patrocinio_letras",
    label: "Valor del patrocinio en letras",
    type: "text",
    source: "pago",
    aliases: ["valor del patrocinio en letras"],
  },

  // --- Stand ---
  {
    key: "tamano_stand",
    label: "Tamaño del stand",
    type: "text",
    source: "stand",
    aliases: ["tamano del stand", "medidas del stand", "metros"],
  },
  {
    key: "pabellon",
    label: "Pabellón",
    type: "text",
    source: "stand",
    aliases: ["pabellon"],
  },
  {
    key: "numero_stand",
    label: "Número de stand",
    type: "text",
    source: "stand",
    aliases: ["numero de stand", "stand numero"],
  },
  {
    key: "ubicacion",
    label: "Ubicación",
    type: "text",
    source: "stand",
    aliases: ["ubicacion"],
  },

  // --- Patrocinio ---
  {
    key: "tipo_patrocinio",
    label: "Tipo de patrocinio",
    type: "select",
    source: "patrocinio",
    aliases: ["tipo de patrocinio", "categoria de patrocinio"],
    options: [
      "Patrocinio Black",
      "Patrocinio Diamante",
      "Patrocinio Platino",
      "Patrocinio Oro",
      "Patrocinio Plata",
      "Patrocinio Bronce",
      "Patrocinio Académico",
    ],
  },
];

const KNOWN_BY_KEY = new Map(KNOWN_VARIABLES.map((v) => [v.key, v]));

export function getKnownVariable(key: string): KnownVariable | undefined {
  return KNOWN_BY_KEY.get(key);
}

/** Origen de una variable: el del catálogo, o "manual" si no está. */
export function getVariableSource(key: string): VariableSource {
  return KNOWN_BY_KEY.get(key)?.source ?? "manual";
}

/**
 * Variables que el sistema resuelve solo y que por tanto NO deben pedirse
 * como campo del formulario al crear el contrato.
 */
export function isAutoFilled(key: string): boolean {
  const source = getVariableSource(key);
  return source !== "manual";
}

// ================================================
// Conversión .docx -> HTML
// ================================================

export interface DocxConversion {
  html: string;
  /** Avisos que devolvió mammoth (estilos no soportados, etc.) */
  warnings: string[];
  /** Imágenes descartadas: el encabezado y el pie se inyectan aparte */
  removedImages: number;
}

/** Convierte un archivo .docx a HTML normalizado y listo para editar. */
export async function convertDocxToHtml(file: File): Promise<DocxConversion> {
  // Carga diferida: mammoth pesa medio megabyte y solo hace falta al importar.
  const { default: mammoth } = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      ignoreEmptyParagraphs: true,
      // No se leen los binarios de las imágenes: se descartan al normalizar,
      // y convertirlas a base64 para tirarlas cuesta segundos en documentos
      // con fotos de varios megas.
      convertImage: mammoth.images.imgElement(() => ({})),
    },
  );

  const { html, removedImages } = normalizeContractHtml(result.value);

  return {
    html,
    warnings: result.messages
      .filter((m) => m.type === "warning" || m.type === "error")
      .map((m) => m.message),
    removedImages,
  };
}

// ================================================
// Normalización de estilos
// ================================================

/** Estilos en línea que replican la estética de las plantillas existentes. */
const STYLES = {
  wrapper:
    "font-family: Georgia, serif; max-width: 820px; margin: 0 auto; padding: 48px 56px; line-height: 1.9; color: #1a1a1a; font-size: 14px;",
  h1: "font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 0 0 8px 0; text-transform: uppercase; text-align: center;",
  h2: "font-size: 16px; font-weight: normal; margin: 0 0 24px 0; letter-spacing: 0.5px; text-transform: uppercase; text-align: center;",
  h3: "font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;",
  p: "text-align: justify; margin-bottom: 16px;",
  list: "text-align: justify; padding-left: 24px; margin-bottom: 12px;",
  li: "margin-bottom: 8px;",
  table: "width: 100%; border-collapse: collapse; margin: 16px 0;",
  td: "border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top;",
} as const;

/**
 * Aplica los estilos del contrato al HTML crudo de mammoth y lo envuelve en el
 * contenedor estándar. Elimina imágenes: el encabezado, el pie y la firma se
 * inyectan automáticamente al mostrar el contrato.
 */
export function normalizeContractHtml(rawHtml: string): {
  html: string;
  removedImages: number;
} {
  const doc = new DOMParser().parseFromString(
    `<div>${rawHtml}</div>`,
    "text/html",
  );
  const root = doc.body.firstElementChild;
  if (!root) return { html: rawHtml, removedImages: 0 };

  const images = root.querySelectorAll("img");
  const removedImages = images.length;
  images.forEach((img) => img.remove());

  const setStyle = (selector: string, style: string) => {
    root.querySelectorAll(selector).forEach((el) => {
      el.setAttribute("style", style);
    });
  };

  setStyle("h1", STYLES.h1);
  setStyle("h2", STYLES.h2);
  setStyle("h3, h4, h5, h6", STYLES.h3);
  setStyle("p", STYLES.p);
  setStyle("ol, ul", STYLES.list);
  setStyle("li", STYLES.li);
  setStyle("table", STYLES.table);
  setStyle("td, th", STYLES.td);

  // Un párrafo que solo contiene texto en negrita y es corto se comporta como
  // título de cláusula ("PRIMERA. OBJETO"): así lo escriben los .docx de EFFIX.
  root.querySelectorAll("p").forEach((p) => {
    const text = (p.textContent ?? "").trim();
    const onlyBold =
      p.children.length === 1 &&
      p.children[0].tagName === "STRONG" &&
      p.children[0].textContent?.trim() === text;
    if (onlyBold && text.length > 0 && text.length <= 90) {
      const h3 = doc.createElement("h3");
      h3.setAttribute("style", STYLES.h3);
      h3.textContent = text;
      p.replaceWith(h3);
    }
  });

  root.setAttribute("style", STYLES.wrapper);
  return { html: root.outerHTML, removedImages };
}

// ================================================
// Detección de marcadores
// ================================================

export interface Placeholder {
  /** Texto exacto tal como aparece en el documento, p. ej. "[NOMBRE COMPLETO]" */
  raw: string;
  /** Etiqueta legible extraída del marcador, p. ej. "NOMBRE COMPLETO" */
  label: string;
  /** Veces que aparece en el documento */
  count: number;
  /** Fragmento de texto alrededor de la primera aparición, para dar contexto */
  context: string;
  /** Variable sugerida del catálogo, si alguna coincide */
  suggestedKey: string | null;
}

// [algo] · ____ · xxxx — los tres estilos que usan los contratos base
const PLACEHOLDER_REGEX = /\[[^\][]{0,80}\]|_{3,}|[xX]{4,}/g;

/** Quita tildes y normaliza para comparar etiquetas contra los alias. */
function normalizeLabel(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Busca en el catálogo la variable que mejor describe una etiqueta. */
export function suggestVariableForLabel(label: string): string | null {
  const normalized = normalizeLabel(label);
  if (!normalized) return null;

  for (const variable of KNOWN_VARIABLES) {
    if (
      variable.aliases.some((alias) => normalizeLabel(alias) === normalized)
    ) {
      return variable.key;
    }
  }
  // Coincidencia parcial: la etiqueta contiene un alias suficientemente largo
  for (const variable of KNOWN_VARIABLES) {
    for (const alias of variable.aliases) {
      const normalizedAlias = normalizeLabel(alias);
      if (normalizedAlias.length >= 5 && normalized.includes(normalizedAlias)) {
        return variable.key;
      }
    }
  }
  return null;
}

/** Encuentra los marcadores del documento agrupados por texto exacto. */
export function detectPlaceholders(html: string): Placeholder[] {
  const text = htmlToText(html);
  const found = new Map<string, Placeholder>();

  for (const match of text.matchAll(PLACEHOLDER_REGEX)) {
    const raw = match[0];
    const existing = found.get(raw);
    if (existing) {
      existing.count += 1;
      continue;
    }

    const label = raw.replace(/^\[|\]$/g, "").trim();
    const start = Math.max(0, (match.index ?? 0) - 60);
    const end = Math.min(text.length, (match.index ?? 0) + raw.length + 60);
    const isPlaceholderLabel = /^[_xX\s]*$/.test(label);

    found.set(raw, {
      raw,
      label: isPlaceholderLabel ? "" : label,
      count: 1,
      context: `…${text.slice(start, end).trim()}…`,
      suggestedKey: isPlaceholderLabel ? null : suggestVariableForLabel(label),
    });
  }

  return Array.from(found.values());
}

/** Texto plano del HTML, para buscar marcadores sin tropezar con etiquetas. */
function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ");
}

/**
 * Sustituye los marcadores por variables Handlebars. Opera sobre los nodos de
 * texto para no dañar el marcado.
 *
 * @param mapping marcador exacto -> clave de variable (`""` para dejarlo igual)
 */
export function applyPlaceholderMapping(
  html: string,
  mapping: Record<string, string>,
): string {
  const entries = Object.entries(mapping).filter(([, key]) => key);
  if (entries.length === 0) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    let value = node.nodeValue ?? "";
    for (const [raw, key] of entries) {
      if (value.includes(raw)) value = value.split(raw).join(`{{${key}}}`);
    }
    node.nodeValue = value;
  }

  return doc.body.innerHTML;
}

// ================================================
// Variables de la plantilla
// ================================================

/**
 * Arma el arreglo `variables` que se guarda en `contract_templates`, tomando
 * del catálogo lo que ya conoce el sistema y de `overrides` lo que definió el
 * usuario para las variables nuevas.
 */
export function buildTemplateVariables(
  keys: string[],
  overrides: Record<string, Partial<TemplateVariable>> = {},
): TemplateVariable[] {
  return (
    keys
      // Los datos del organizador se inyectan solos: no son campos del formulario.
      .filter((key) => getVariableSource(key) !== "organizador")
      .map((key) => {
        const known = KNOWN_BY_KEY.get(key);
        const override = overrides[key] ?? {};
        const options = override.options?.length
          ? override.options
          : known?.options;
        return {
          key,
          label: override.label ?? known?.label ?? humanizeKey(key),
          type: override.type ?? known?.type ?? "text",
          required: override.required ?? known?.defaultRequired ?? true,
          ...(override.placeholder
            ? { placeholder: override.placeholder }
            : {}),
          ...(options?.length ? { options } : {}),
        };
      })
  );
}

/** "valor_transporte" -> "Valor transporte" */
export function humanizeKey(key: string): string {
  const words = key.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "Contrato de Ponente 2027" -> "contrato-de-ponente-2027" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Clave de variable válida para Handlebars: minúsculas y guiones bajos. */
export function toVariableKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}
