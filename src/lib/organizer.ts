/**
 * Empresas emisoras (razones sociales) con las que se pueden generar contratos.
 * Fuente: RUT EFFIX + Cámara de Comercio de Medellín (marzo 2026).
 *
 * Ambas razones sociales comparten representante legal, dirección, contacto e
 * imágenes de marca (encabezado, pie de página y firma); solo cambian el nombre
 * y el NIT. Los datos elegidos se congelan en contracts.contract_data (claves
 * org_*) y en rendered_html al crear cada contrato.
 */
export type IssuerId = "effix" | "feria-effix";

export interface Issuer {
  id: IssuerId;
  /** Nombre corto para el selector y el badge */
  label: string;
  /** Razón social exacta, tal como debe aparecer en el contrato */
  empresa: string;
  nit: string;
  nombre: string;
  documento_tipo: string;
  documento: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  email: string;
  telefono: string;
  lugar_evento: string;
}

const SHARED = {
  nombre: "OMAR STEVENSON RIVERA CORREA",
  documento_tipo: "C.C.",
  documento: "1.128.478.351",
  direccion: "Transversal 39B #76-19",
  ciudad: "Medellín",
  departamento: "Antioquia",
  pais: "Colombia",
  email: "gerencia@feriaeffix.com",
  telefono: "320 6556725",
  lugar_evento: "Plaza Mayor Medellín Convenciones y Exposiciones",
};

export const ISSUERS: readonly Issuer[] = [
  {
    id: "effix",
    label: "EFFIX S.A.S.",
    empresa: "EFFIX S.A.S.",
    nit: "901.497.359-1",
    ...SHARED,
  },
  {
    id: "feria-effix",
    label: "Feria Effix S.A.S.",
    empresa: "FERIA EFFIX S.A.S.",
    nit: "902.062.176-5",
    ...SHARED,
  },
];

export const DEFAULT_ISSUER_ID: IssuerId = "effix";

export function isIssuerId(value: unknown): value is IssuerId {
  return ISSUERS.some((issuer) => issuer.id === value);
}

/**
 * Devuelve la empresa emisora por su id. Si el id es nulo o desconocido (por
 * ejemplo, contratos anteriores a la selección de empresa) devuelve la empresa
 * por defecto.
 */
export function getIssuer(id?: string | null): Issuer {
  return (
    ISSUERS.find((issuer) => issuer.id === id) ??
    ISSUERS.find((issuer) => issuer.id === DEFAULT_ISSUER_ID)!
  );
}

/** Variables org_* que se inyectan en las plantillas Handlebars. */
export function issuerToTemplateData(issuer: Issuer): Record<string, string> {
  return {
    org_nombre: issuer.nombre,
    org_documento_tipo: issuer.documento_tipo,
    org_documento: issuer.documento,
    org_empresa: issuer.empresa,
    org_nit: issuer.nit,
    org_direccion: issuer.direccion,
    org_ciudad: issuer.ciudad,
    org_departamento: issuer.departamento,
    org_pais: issuer.pais,
    org_email: issuer.email,
    org_telefono: issuer.telefono,
    org_lugar_evento: issuer.lugar_evento,
  };
}
