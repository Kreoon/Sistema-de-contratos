import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eraser, PenTool, Type } from 'lucide-react'

interface SignaturePadProps {
  onSignature: (data: { type: 'drawn' | 'typed'; value: string }) => void
}

export function SignaturePad({ onSignature }: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null)
  const [mode, setMode] = useState<'drawn' | 'typed'>('drawn')
  const [typedName, setTypedName] = useState('')
  const [hasDrawn, setHasDrawn] = useState(false)

  const handleClear = () => {
    sigPadRef.current?.clear()
    setHasDrawn(false)
    onSignature({ type: 'drawn', value: '' })
  }

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setHasDrawn(true)
      const dataUrl = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')
      onSignature({ type: 'drawn', value: dataUrl })
    }
  }

  const handleTypedChange = (value: string) => {
    setTypedName(value)
    onSignature({ type: 'typed', value })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'drawn' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('drawn')}
        >
          <PenTool size={14} className="mr-1" /> Dibujar firma
        </Button>
        <Button
          type="button"
          variant={mode === 'typed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('typed')}
        >
          <Type size={14} className="mr-1" /> Escribir nombre
        </Button>
      </div>

      {mode === 'drawn' ? (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white relative">
            <SignatureCanvas
              ref={sigPadRef}
              canvasProps={{
                className: 'w-full h-48 rounded-lg',
                style: { width: '100%', height: '192px' },
              }}
              penColor="#1a1a2e"
              onEnd={handleEnd}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">Dibuje su firma aquí</p>
              </div>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="mt-2">
            <Eraser size={14} className="mr-1" /> Limpiar
          </Button>
        </div>
      ) : (
        <div>
          <Input
            value={typedName}
            onChange={(e) => handleTypedChange(e.target.value)}
            placeholder="Escriba su nombre completo"
            className="text-lg"
          />
          {typedName && (
            <div className="mt-3 p-4 border rounded-lg bg-white">
              <p className="text-2xl italic text-gray-800" style={{ fontFamily: 'cursive' }}>
                {typedName}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
