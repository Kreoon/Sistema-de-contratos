import { useTemplates } from '@/hooks/useTemplates'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export function Templates() {
  const { templates, loading } = useTemplates()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plantillas de Contrato</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Templates disponibles para generar contratos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText size={24} className="text-[hsl(var(--primary))] shrink-0" />
                <Badge variant="outline">{template.variables.length} campos</Badge>
              </div>
              <CardTitle className="text-base mt-2">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {template.variables
                  .filter(v => v.required)
                  .slice(0, 5)
                  .map(v => (
                    <span
                      key={v.key}
                      className="text-xs bg-[hsl(var(--secondary))] px-2 py-0.5 rounded"
                    >
                      {v.label}
                    </span>
                  ))}
                {template.variables.filter(v => v.required).length > 5 && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    +{template.variables.filter(v => v.required).length - 5} más
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-[hsl(var(--muted-foreground))]">
              No hay plantillas disponibles. Ejecuta el seed de la base de datos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
