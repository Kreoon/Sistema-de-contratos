import type { AuditMetadata, DeviceInfo } from './types'

/**
 * Captura metadata del navegador para el audit trail
 */
export async function captureAuditMetadata(captureIpUrl?: string): Promise<AuditMetadata> {
  const userAgent = navigator.userAgent
  const deviceInfo = getDeviceInfo()

  let ipAddress = 'unknown'
  let geolocation = null

  // Capturar IP via Edge Function o servicio externo
  try {
    if (captureIpUrl) {
      const res = await fetch(captureIpUrl)
      const data = await res.json()
      ipAddress = data.ip || 'unknown'
    } else {
      // Fallback: usar servicio público
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      ipAddress = data.ip || 'unknown'
    }
  } catch {
    console.warn('No se pudo capturar la IP')
  }

  // Capturar geolocalización del navegador (requiere permiso)
  try {
    if ('geolocation' in navigator) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      })
      geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        country: '',
        city: '',
        region: '',
      }
    }
  } catch {
    // Geolocation no disponible o rechazada - es opcional
  }

  return {
    ip_address: ipAddress,
    user_agent: userAgent,
    geolocation,
    device_info: deviceInfo,
  }
}

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent
  return {
    browser: getBrowser(ua),
    os: getOS(ua),
    device_type: getDeviceType(),
    screen: `${window.screen.width}x${window.screen.height}`,
  }
}

function getBrowser(ua: string): string {
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  return 'Otro'
}

function getOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Otro'
}

function getDeviceType(): string {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}
