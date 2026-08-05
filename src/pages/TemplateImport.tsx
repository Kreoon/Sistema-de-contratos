import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  FileUp,
  Loader2,
  Save,
  Wand2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  extractVariables,
  injectContractBranding,
  renderTemplate,
} from "@/lib/template-engine";
import {
  KNOWN_VARIABLES,
  SOURCE_INFO,
  applyPlaceholderMapping,
  buildTemplateVariables,
  convertDocxToHtml,
  detectPlaceholders,
  getKnownVariable,
  getVariableSource,
  humanizeKey,
  slugify,
  toVariableKey,
  type Placeholder,
  type VariableSource,
} from "@/lib/docx-import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@/components/contracts/RichTextEditor";
import type { TemplateVariable } from "@/lib/types";

// Valor especial del selector de marcadores: crear una variable propia
const CUSTOM = "__custom__";

const SOURCE_BADGE: Record<VariableSource, string> = {
  organizador: "bg-slate-100 text-slate-700",
  contacto: "bg-blue-100 text-blue-700",
  pago: "bg-emerald-100 text-emerald-700",
  stand: "bg-amber-100 text-amber-700",
  evento: "bg-violet-100 text-violet-700",
  patrocinio: "bg-pink-100 text-pink-700",
  manual: "bg-orange-100 text-orange-700",
};

function SourceBadge({ source }: { source: VariableSource }) {
  return (
    <span
      title={SOURCE_INFO[source].description}
      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SOURCE_BADGE[source]}`}
    >
      {SOURCE_INFO[source].label}
    </span>
  );
}

export function TemplateImport() {
  const navigate = useNavigate();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState("");
  const [converting, setConverting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState(0);

  const [html, setHtml] = useState("");
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  /** marcador exacto -> clave de variable ("" = dejarlo tal cual) */
  const [mapping, setMapping] = useState<Record<string, string>>({});
  /** marcador -> nombre escrito a mano cuando se elige "Nueva variable" */
  const [customNames, setCustomNames] = useState<Record<string, string>>({});

  const [overrides, setOverrides] = useState<
    Record<string, Partial<TemplateVariable>>
  >({});

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Variables Handlebars presentes en el contenido actual
  const usedKeys = useMemo(() => extractVariables(html), [html]);
  const manualKeys = useMemo(
    () => usedKeys.filter((key) => getVariableSource(key) === "manual"),
    [usedKeys],
  );
  const pendingPlaceholders = placeholders.filter((p) => html.includes(p.raw));

  // --- Paso 1: convertir el .docx ---
  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast.error("Formato no admitido", {
        description: "Solo se puede importar .docx (Word). El .doc antiguo no.",
      });
      return;
    }
    setConverting(true);
    try {
      const result = await convertDocxToHtml(file);
      const detected = detectPlaceholders(result.html);

      setFileName(file.name);
      setHtml(result.html);
      setWarnings(result.warnings);
      setRemovedImages(result.removedImages);
      setPlaceholders(detected);
      setMapping(
        Object.fromEntries(
          detected.map((p) => [p.raw, p.suggestedKey ?? ""] as const),
        ),
      );
      setCustomNames({});

      // Nombre sugerido a partir del archivo
      const suggested = file.name
        .replace(/\.docx$/i, "")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      setName(suggested);
      if (!slugTouched) setSlug(slugify(suggested));

      setStep(2);
      toast.success("Documento convertido", {
        description:
          detected.length > 0
            ? `Se encontraron ${detected.length} marcadores para revisar.`
            : "No se encontraron marcadores; inserta las variables a mano.",
      });
    } catch (error) {
      toast.error("No se pudo leer el archivo", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setConverting(false);
    }
  };

  // --- Paso 2: marcadores -> variables ---
  const resolveKey = (placeholder: Placeholder): string => {
    const selected = mapping[placeholder.raw] ?? "";
    if (selected !== CUSTOM) return selected;
    return toVariableKey(customNames[placeholder.raw] ?? "");
  };

  const applyMapping = () => {
    const resolved: Record<string, string> = {};
    for (const placeholder of pendingPlaceholders) {
      const key = resolveKey(placeholder);
      if (key) resolved[placeholder.raw] = key;
    }
    const count = Object.keys(resolved).length;
    if (count === 0) {
      toast.error("Nada que reemplazar", {
        description: "Asigna una variable a por lo menos un marcador.",
      });
      return;
    }
    setHtml(applyPlaceholderMapping(html, resolved));
    toast.success(
      `${count} ${count === 1 ? "marcador reemplazado" : "marcadores reemplazados"}`,
    );
  };

  const insertVariable = (key: string) => {
    editorRef.current?.insertHtml(`{{${key}}}`);
  };

  const setOverride = (key: string, patch: Partial<TemplateVariable>) => {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  // --- Paso 3: guardar ---
  const previewHtml = useMemo(() => {
    if (!showPreview) return "";
    const sample: Record<string, string> = {};
    for (const key of usedKeys) {
      const known = getKnownVariable(key);
      sample[key] = `«${known?.label ?? humanizeKey(key)}»`;
    }
    try {
      // Mismo motor que al generar un contrato real, para que la vista previa
      // muestre también el efecto de los bloques {{#if}}.
      return injectContractBranding(renderTemplate(html, sample));
    } catch {
      // Plantilla a medio escribir (un {{#if}} sin cerrar, por ejemplo):
      // se sustituyen las variables sin interpretar la lógica.
      return injectContractBranding(renderSample(html, sample));
    }
  }, [showPreview, html, usedKeys]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const finalSlug = slug.trim() || slugify(trimmedName);

    if (!trimmedName) {
      toast.error("Falta el nombre de la plantilla");
      return;
    }
    if (!finalSlug) {
      toast.error("Falta el identificador (slug)");
      return;
    }
    if (!html.trim()) {
      toast.error("La plantilla no tiene contenido");
      return;
    }

    setSaving(true);
    const variables = buildTemplateVariables(usedKeys, overrides);
    const { data, error } = await supabase
      .from("contract_templates")
      .insert({
        name: trimmedName,
        slug: finalSlug,
        description: description.trim() || null,
        content: html,
        variables,
        is_active: true,
      })
      .select("id")
      .single();
    setSaving(false);

    if (error) {
      const duplicated = error.code === "23505";
      toast.error("No se pudo guardar la plantilla", {
        description: duplicated
          ? `Ya existe una plantilla con el identificador "${finalSlug}". Usa otro.`
          : error.message,
      });
      return;
    }

    toast.success("Plantilla creada", {
      description: `"${trimmedName}" ya aparece al crear un contrato nuevo.`,
    });
    navigate("/templates", { state: { createdId: data?.id } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Importar plantilla</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Sube un contrato en Word y conviértelo en una plantilla reutilizable
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/templates")}>
          <ArrowLeft size={16} className="mr-2" /> Volver
        </Button>
      </div>

      {/* Pasos */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { n: 1 as const, label: "Archivo" },
          { n: 2 as const, label: "Contenido y variables" },
          { n: 3 as const, label: "Datos y guardado" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[hsl(var(--muted-foreground))]">—</span>
            )}
            <button
              type="button"
              disabled={s.n > 1 && !html}
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                step === s.n
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "hover:bg-[hsl(var(--secondary))]"
              }`}
            >
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border text-xs">
                {step > s.n ? <Check size={12} /> : s.n}
              </span>
              {s.label}
            </button>
          </div>
        ))}
      </div>

      {/* ---------- Paso 1: archivo ---------- */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documento de Word</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-[hsl(var(--primary))] transition-colors"
            >
              {converting ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2
                    size={32}
                    className="animate-spin text-[hsl(var(--primary))]"
                  />
                  <p className="text-sm">Convirtiendo documento…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileUp
                    size={32}
                    className="text-[hsl(var(--muted-foreground))]"
                  />
                  <p className="font-medium">
                    Arrastra el archivo .docx o haz clic para elegirlo
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Se conserva el texto, las listas y las tablas. Las imágenes
                    se descartan: el encabezado, el pie y la firma se agregan
                    solos.
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Consejo: marca en el Word los datos variables como{" "}
              <code className="px-1 rounded bg-[hsl(var(--secondary))]">
                [NOMBRE COMPLETO]
              </code>
              . El sistema los detecta y te propone la variable que corresponde.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ---------- Paso 2: contenido y variables ---------- */}
      {step === 2 && (
        <div className="space-y-4">
          {(warnings.length > 0 || removedImages > 0) && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="py-3 text-sm space-y-1">
                <p className="font-medium text-amber-900">
                  Avisos de la conversión de {fileName}
                </p>
                {removedImages > 0 && (
                  <p className="text-amber-800">
                    Se descartaron {removedImages}{" "}
                    {removedImages === 1 ? "imagen" : "imágenes"} del documento.
                  </p>
                )}
                {warnings.slice(0, 5).map((w, i) => (
                  <p key={i} className="text-amber-800">
                    {w}
                  </p>
                ))}
                {warnings.length > 5 && (
                  <p className="text-amber-800">
                    …y {warnings.length - 5} avisos más.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Editor */}
            <div className="xl:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contenido de la plantilla</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview((v) => !v)}
                >
                  <Eye size={14} className="mr-2" />
                  {showPreview ? "Ocultar" : "Ver"} vista previa
                </Button>
              </div>
              {showPreview ? (
                <div className="border rounded-md bg-white overflow-auto max-h-[75vh]">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <RichTextEditor
                  ref={editorRef}
                  value={html}
                  onChange={setHtml}
                />
              )}
            </div>

            {/* Panel lateral */}
            <div className="space-y-4">
              {/* Marcadores detectados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Marcadores detectados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingPlaceholders.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      No quedan marcadores sin resolver. Puedes insertar más
                      variables desde la lista de abajo.
                    </p>
                  ) : (
                    <>
                      {pendingPlaceholders.map((p) => (
                        <div
                          key={p.raw}
                          className="space-y-1 pb-3 border-b last:border-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-xs font-medium bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded">
                              {p.raw}
                            </code>
                            {p.count > 1 && (
                              <Badge variant="outline">×{p.count}</Badge>
                            )}
                          </div>
                          <p
                            className="text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-2"
                            title={p.context}
                          >
                            {p.context}
                          </p>
                          <Select
                            className="h-9 text-xs"
                            value={mapping[p.raw] ?? ""}
                            onChange={(e) =>
                              setMapping((prev) => ({
                                ...prev,
                                [p.raw]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Dejar como está</option>
                            <option value={CUSTOM}>+ Variable nueva…</option>
                            {KNOWN_VARIABLES.map((v) => (
                              <option key={v.key} value={v.key}>
                                {v.label} ({SOURCE_INFO[v.source].label})
                              </option>
                            ))}
                          </Select>
                          {mapping[p.raw] === CUSTOM && (
                            <Input
                              className="h-9 text-xs"
                              placeholder="Nombre del campo (ej. Valor del transporte)"
                              value={customNames[p.raw] ?? ""}
                              onChange={(e) =>
                                setCustomNames((prev) => ({
                                  ...prev,
                                  [p.raw]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={applyMapping}
                      >
                        <Wand2 size={14} className="mr-2" /> Reemplazar en el
                        contrato
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Insertar variable */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Insertar variable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                    Pon el cursor en el editor y elige un campo para insertarlo
                    ahí.
                  </p>
                  <Select
                    className="h-9 text-xs"
                    value=""
                    disabled={showPreview}
                    onChange={(e) => {
                      if (e.target.value) insertVariable(e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Elegir campo…</option>
                    {KNOWN_VARIABLES.map((v) => (
                      <option key={v.key} value={v.key}>
                        {v.label} ({SOURCE_INFO[v.source].label})
                      </option>
                    ))}
                  </Select>
                </CardContent>
              </Card>

              {/* Variables en uso */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Variables en la plantilla ({usedKeys.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-72 overflow-auto">
                  {usedKeys.length === 0 && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      Todavía no hay variables. El contrato saldría igual para
                      todos.
                    </p>
                  )}
                  {usedKeys.map((key) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-2"
                    >
                      <code className="text-xs">{`{{${key}}}`}</code>
                      <SourceBadge source={getVariableSource(key)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft size={16} className="mr-2" /> Cambiar archivo
            </Button>
            <Button onClick={() => setStep(3)}>
              Continuar <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ---------- Paso 3: datos y guardado ---------- */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la plantilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>
                  Nombre{" "}
                  <span className="text-[hsl(var(--destructive))]">*</span>
                </Label>
                <Input
                  value={name}
                  placeholder="Contrato de Ponente 2027"
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Es el nombre que verás al elegir plantilla en un contrato
                  nuevo.
                </p>
              </div>
              <div className="space-y-1">
                <Label>
                  Identificador{" "}
                  <span className="text-[hsl(var(--destructive))]">*</span>
                </Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Único por plantilla. Se usa internamente.
                </p>
              </div>
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea
                  rows={3}
                  value={description}
                  placeholder="Para qué sirve esta plantilla"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Campos que se pedirán a mano ({manualKeys.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                El resto de variables las completa el sistema con los datos de
                EFFIX, del contacto elegido y de la forma de pago.
              </p>
              {manualKeys.length === 0 ? (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  No hay campos manuales: todo se completa solo.
                </p>
              ) : (
                manualKeys.map((key) => {
                  const override = overrides[key] ?? {};
                  return (
                    <div
                      key={key}
                      className="space-y-2 pb-3 border-b last:border-0"
                    >
                      <code className="text-xs bg-[hsl(var(--secondary))] px-1.5 py-0.5 rounded">
                        {`{{${key}}}`}
                      </code>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Etiqueta</Label>
                          <Input
                            className="h-9 text-xs"
                            value={override.label ?? humanizeKey(key)}
                            onChange={(e) =>
                              setOverride(key, { label: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Select
                            className="h-9 text-xs"
                            value={override.type ?? "text"}
                            onChange={(e) =>
                              setOverride(key, {
                                type: e.target
                                  .value as TemplateVariable["type"],
                              })
                            }
                          >
                            <option value="text">Texto</option>
                            <option value="textarea">Texto largo</option>
                            <option value="number">Número</option>
                            <option value="date">Fecha</option>
                            <option value="email">Correo</option>
                            <option value="select">Lista de opciones</option>
                          </Select>
                        </div>
                      </div>
                      {override.type === "select" && (
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Opciones (una por línea)
                          </Label>
                          <Textarea
                            rows={3}
                            className="text-xs"
                            value={(override.options ?? []).join("\n")}
                            onChange={(e) =>
                              setOverride(key, {
                                options: e.target.value
                                  .split("\n")
                                  .map((o) => o.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-xs">
                        <Checkbox
                          checked={override.required ?? true}
                          onChange={(e) =>
                            setOverride(key, { required: e.target.checked })
                          }
                        />
                        Obligatorio
                      </label>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft size={16} className="mr-2" /> Volver al contenido
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Guardar plantilla
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Renderiza el contenido con valores de muestra, tolerando plantillas a medio hacer. */
function renderSample(content: string, sample: Record<string, string>): string {
  return content.replace(
    /\{\{\{?\s*([^#/!>{}][^{}]*?)\s*\}?\}\}/g,
    (match, expression: string) => {
      const key = expression.trim().split(/\s+/).pop() ?? "";
      return sample[key] ?? match;
    },
  );
}
