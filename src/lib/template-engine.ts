import Handlebars from 'handlebars'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Helper: formatear moneda COP
Handlebars.registerHelper('cop', (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return value
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(num)
})

// Helper: formatear fecha en español
Handlebars.registerHelper('fecha', (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
})

// Helper: fecha corta
Handlebars.registerHelper('fechaCorta', (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  return format(date, 'dd/MM/yyyy')
})

// Helper: hora
Handlebars.registerHelper('hora', (value: string) => {
  if (!value) return ''
  return value
})

// Helper: uppercase
Handlebars.registerHelper('upper', (value: string) => {
  return value?.toUpperCase() ?? ''
})

// Helper: numero a letras (simplificado)
Handlebars.registerHelper('enLetras', (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return value
  return `${new Intl.NumberFormat('es-CO').format(num)} pesos colombianos`
})

/**
 * Renderiza un template Handlebars con los datos proporcionados
 */
export function renderTemplate(templateContent: string, data: Record<string, string>): string {
  const compiled = Handlebars.compile(templateContent)
  return compiled(data)
}

/**
 * Inyecta la firma de Omar Stevenson Rivera en la sección del contratante/concedente
 * para contratos cuyo rendered_html no la incluye aún.
 */
export function injectEmployerSignature(html: string): string {
  const signatureImg = '<img src="/firma-omar-stevenson.png" alt="Firma Omar Stevenson Rivera" style="max-height: 80px; max-width: 200px; margin-bottom: 4px;" />'
  // Si ya tiene la firma, no duplicar
  if (html.includes('firma-omar-stevenson')) return html
  // Inyectar antes del border-top div que contiene "EL CONTRATANTE" o "EL CONCEDENTE"
  return html.replace(
    /(<div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">\s*<p[^>]*>(?:EL CONTRATANTE|EL CONCEDENTE)<\/p>)/g,
    `${signatureImg}\n      $1`
  )
}

/**
 * Inyecta encabezado y pie de página al contrato (vista previa web).
 */
export function injectHeaderFooter(html: string): string {
  if (html.includes('contract-header-img')) return html
  const header = '<div class="contract-header-img" style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;"><img src="/Encabezado.png" alt="Encabezado" style="width: 100%; max-width: 100%;" /></div>'
  const footer = '<div style="text-align: center; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;"><img src="/Pie de pagina.png" alt="Pie de página" style="width: 100%; max-width: 100%;" /></div>'
  return header + html + footer
}

/**
 * Aplica todas las inyecciones al HTML del contrato (firma empleador + encabezado/pie).
 */
export function injectContractBranding(html: string): string {
  return injectHeaderFooter(injectEmployerSignature(html))
}

/**
 * Extrae las variables usadas en un template (para validación)
 */
export function extractVariables(templateContent: string): string[] {
  const regex = /\{\{([^#/!>][^}]*)\}\}/g
  const variables = new Set<string>()
  let match
  while ((match = regex.exec(templateContent)) !== null) {
    const varName = match[1].trim().split(' ')[0]
    if (!['cop', 'fecha', 'fechaCorta', 'hora', 'upper', 'enLetras', 'if', 'else', 'each', 'unless'].includes(varName)) {
      variables.add(varName)
    }
  }
  return Array.from(variables)
}
