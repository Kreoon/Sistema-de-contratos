import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/docx-import";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContractTemplate } from "@/lib/types";

export function Templates() {
  const { templates, loading, refetch } = useTemplates({
    includeInactive: true,
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggleActive = async (template: ContractTemplate) => {
    setBusyId(template.id);
    const { error } = await supabase
      .from("contract_templates")
      .update({ is_active: !template.is_active })
      .eq("id", template.id);
    setBusyId(null);

    if (error) {
      toast.error("No se pudo cambiar el estado", {
        description: error.message,
      });
      return;
    }
    toast.success(
      template.is_active
        ? `"${template.name}" ya no aparece al crear contratos`
        : `"${template.name}" vuelve a estar disponible`,
    );
    refetch();
  };

  /** Identificador libre a partir del nombre: "x", "x-2", "x-3"... */
  const uniqueSlug = (name: string) => {
    const base = slugify(name) || "plantilla";
    const taken = new Set(templates.map((t) => t.slug));
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  };

  const duplicate = async (template: ContractTemplate) => {
    const name = window.prompt(
      "Nombre de la nueva plantilla:",
      `${template.name} (copia)`,
    );
    if (name === null) return;
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("La plantilla necesita un nombre");
      return;
    }

    setBusyId(template.id);
    const { error } = await supabase.from("contract_templates").insert({
      name: trimmed,
      slug: uniqueSlug(trimmed),
      description: template.description,
      content: template.content,
      variables: template.variables,
      is_active: true,
    });
    setBusyId(null);

    if (error) {
      toast.error("No se pudo duplicar", { description: error.message });
      return;
    }
    toast.success(`Plantilla "${trimmed}" creada`, {
      description: "Copia el contenido y los campos de la original.",
    });
    refetch();
  };

  const remove = async (template: ContractTemplate) => {
    const confirmed = window.confirm(
      `¿Eliminar la plantilla "${template.name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setBusyId(template.id);
    const { error } = await supabase
      .from("contract_templates")
      .delete()
      .eq("id", template.id);
    setBusyId(null);

    if (error) {
      // 23503: hay contratos que la referencian
      toast.error("No se pudo eliminar", {
        description:
          error.code === "23503"
            ? "Ya se generaron contratos con esta plantilla. Desactívala en lugar de eliminarla."
            : error.message,
      });
      return;
    }
    toast.success("Plantilla eliminada");
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Contrato</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Templates disponibles para generar contratos
          </p>
        </div>
        <Link to="/templates/import">
          <Button>
            <Upload size={16} className="mr-2" /> Importar plantilla
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`hover:shadow-md transition-shadow ${
              template.is_active ? "" : "opacity-60"
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText
                  size={24}
                  className="text-[hsl(var(--primary))] shrink-0"
                />
                <div className="flex items-center gap-1">
                  {!template.is_active && (
                    <Badge variant="outline">Inactiva</Badge>
                  )}
                  <Badge variant="outline">
                    {template.variables.length} campos
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-base mt-2">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {template.variables
                  .filter((v) => v.required)
                  .slice(0, 5)
                  .map((v) => (
                    <span
                      key={v.key}
                      className="text-xs bg-[hsl(var(--secondary))] px-2 py-0.5 rounded"
                    >
                      {v.label}
                    </span>
                  ))}
                {template.variables.filter((v) => v.required).length > 5 && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    +{template.variables.filter((v) => v.required).length - 5}{" "}
                    más
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <Link to={`/templates/${template.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Pencil size={14} className="mr-1.5" /> Editar
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === template.id}
                  onClick={() => toggleActive(template)}
                >
                  {template.is_active ? (
                    <>
                      <EyeOff size={14} className="mr-1.5" /> Desactivar
                    </>
                  ) : (
                    <>
                      <Eye size={14} className="mr-1.5" /> Activar
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === template.id}
                  onClick={() => duplicate(template)}
                >
                  <Copy size={14} className="mr-1.5" /> Duplicar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(var(--destructive))]"
                  disabled={busyId === template.id}
                  onClick={() => remove(template)}
                >
                  <Trash2 size={14} className="mr-1.5" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 space-y-4">
            <p className="text-[hsl(var(--muted-foreground))]">
              No hay plantillas todavía. Importa un contrato en Word para
              empezar.
            </p>
            <Link to="/templates/import">
              <Button>
                <Upload size={16} className="mr-2" /> Importar plantilla
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
