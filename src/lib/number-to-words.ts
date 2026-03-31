const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const ESPECIALES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
const DECENAS = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

function convertGroup(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cien'

  let result = ''
  const centena = Math.floor(n / 100)
  const resto = n % 100

  if (centena > 0) {
    result += CENTENAS[centena]
    if (resto > 0) result += ' '
  }

  if (resto >= 10 && resto <= 19) {
    result += ESPECIALES[resto - 10]
  } else if (resto >= 21 && resto <= 29) {
    result += 'veinti' + UNIDADES[resto - 20]
  } else {
    const decena = Math.floor(resto / 10)
    const unidad = resto % 10
    if (decena > 0) {
      result += DECENAS[decena]
      if (unidad > 0) result += ' y '
    }
    if (unidad > 0) {
      result += UNIDADES[unidad]
    }
  }

  return result
}

/**
 * Convierte un número a texto en español.
 * Ejemplo: 2500000 → "dos millones quinientos mil"
 */
function numberToText(n: number): string {
  if (n === 0) return 'cero'
  if (n < 0) return 'menos ' + numberToText(-n)

  const num = Math.floor(n)
  let result = ''

  // Billones (millones de millones)
  const billones = Math.floor(num / 1_000_000_000_000)
  if (billones > 0) {
    result += (billones === 1 ? 'un billón' : convertGroup(billones) + ' billones')
  }

  // Millones
  const millones = Math.floor((num % 1_000_000_000_000) / 1_000_000)
  if (millones > 0) {
    if (result) result += ' '
    result += (millones === 1 ? 'un millón' : convertGroup(millones) + ' millones')
  }

  // Miles
  const miles = Math.floor((num % 1_000_000) / 1_000)
  if (miles > 0) {
    if (result) result += ' '
    result += (miles === 1 ? 'mil' : convertGroup(miles) + ' mil')
  }

  // Unidades
  const unidades = num % 1_000
  if (unidades > 0) {
    if (result) result += ' '
    result += convertGroup(unidades)
  }

  return result
}

const CURRENCY_NAMES: Record<string, { singular: string; plural: string }> = {
  COP: { singular: 'peso colombiano', plural: 'pesos colombianos' },
  USD: { singular: 'dólar estadounidense', plural: 'dólares estadounidenses' },
  EUR: { singular: 'euro', plural: 'euros' },
}

/**
 * Convierte un valor numérico a texto con moneda.
 * Ejemplo: (2500000, "COP") → "Dos millones quinientos mil pesos colombianos"
 */
export function moneyToWords(value: number | string, currency: string = 'COP'): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[.,\s]/g, '')) : value
  if (isNaN(num) || num === 0) return ''

  const text = numberToText(num)
  const cur = CURRENCY_NAMES[currency] || CURRENCY_NAMES.COP
  const moneda = num === 1 ? cur.singular : cur.plural

  // Capitalizar primera letra
  return text.charAt(0).toUpperCase() + text.slice(1) + ' ' + moneda
}
