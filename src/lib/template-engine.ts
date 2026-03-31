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
