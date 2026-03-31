import type { ChangeEvent } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface SigningConsentProps {
  accepted: boolean
  onAccept: (accepted: boolean) => void
}

export const CONSENT_TEXT = `Declaro que acepto firmar este contrato de manera electrónica, de conformidad con la Ley 527 de 1999 y el Decreto 2364 de 2012 de la República de Colombia. Reconozco que esta firma electrónica tiene la misma validez y efectos jurídicos que una firma manuscrita. Autorizo el tratamiento de mis datos personales (dirección IP, ubicación, dispositivo) conforme a la Ley 1581 de 2012 de Protección de Datos Personales.`

export function SigningConsent({ accepted, onAccept }: SigningConsentProps) {
  return (
    <div className="bg-[hsl(var(--secondary))] rounded-lg p-4 space-y-3">
      <p className="text-sm text-gray-700 leading-relaxed">{CONSENT_TEXT}</p>
      <label className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          checked={accepted}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onAccept(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm font-medium">
          He leído y acepto las condiciones de firma electrónica
        </span>
      </label>
    </div>
  )
}
