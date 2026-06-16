import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Table,
  Undo,
  Redo,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
  IndentIncrease,
  IndentDecrease,
  RemoveFormatting,
  Minus,
  Type,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

// Botón de la barra de herramientas. onMouseDown preventDefault evita perder
// la selección del editor al hacer clic.
function ToolBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] transition-colors"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-[hsl(var(--border))] mx-1" />;
}

/**
 * Editor de texto enriquecido a medida (WYSIWYG + vista de código HTML).
 * Opera sobre el HTML real del contrato, conservando estilos en línea con fidelidad.
 * El contenido editado es el `rendered_html` del contrato (sin encabezado/pie,
 * que se inyectan automáticamente al mostrar).
 */
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [codeView, setCodeView] = useState(false);

  // Sincroniza el DOM cuando el valor cambia desde fuera (cambio de contrato o
  // edición en vista de código). Tras escribir, value === innerHTML, así que
  // este efecto no reescribe el contenido ni mueve el cursor.
  useEffect(() => {
    if (
      editorRef.current &&
      !codeView &&
      value !== editorRef.current.innerHTML
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value, codeView]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Ejecuta un comando de formato manteniendo el foco/selección en el editor.
  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const setBlock = (tag: string) => exec("formatBlock", tag);

  const insertLink = () => {
    const url = window.prompt("URL del enlace:", "https://");
    if (url) exec("createLink", url);
  };

  const insertTable = () => {
    const cols = parseInt(window.prompt("Número de columnas:", "3") || "0", 10);
    const rows = parseInt(window.prompt("Número de filas:", "3") || "0", 10);
    if (!cols || !rows) return;
    let html =
      '<table style="width:100%; border-collapse:collapse; margin:12px 0;">';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #ccc; padding:8px;">&nbsp;</td>';
      }
      html += "</tr>";
    }
    html += "</table><p></p>";
    exec("insertHTML", html);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-[hsl(var(--card))] sticky top-0 z-10">
        <ToolBtn onClick={() => exec("undo")} title="Deshacer">
          <Undo size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("redo")} title="Rehacer">
          <Redo size={16} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => setBlock("<h1>")} title="Título 1">
          <Heading1 size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => setBlock("<h2>")} title="Título 2">
          <Heading2 size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => setBlock("<h3>")} title="Título 3">
          <Heading3 size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => setBlock("<p>")} title="Párrafo">
          <Type size={16} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec("bold")} title="Negrita">
          <Bold size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Cursiva">
          <Italic size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Subrayado">
          <Underline size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("strikeThrough")} title="Tachado">
          <Strikethrough size={16} />
        </ToolBtn>
        <Divider />
        {/* Color de texto */}
        <label
          title="Color de texto"
          className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-[hsl(var(--secondary))] cursor-pointer relative"
        >
          <Palette size={16} />
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => exec("foreColor", e.target.value)}
          />
        </label>
        {/* Resaltado */}
        <label
          title="Resaltar"
          className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-[hsl(var(--secondary))] cursor-pointer relative"
        >
          <Highlighter size={16} />
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => exec("hiliteColor", e.target.value)}
          />
        </label>
        {/* Tamaño de fuente */}
        <select
          title="Tamaño de fuente"
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.value) {
              exec("fontSize", e.target.value);
              e.target.value = "";
            }
          }}
          className="h-8 text-xs border rounded px-1 bg-[hsl(var(--card))]"
        >
          <option value="" disabled>
            Tamaño
          </option>
          <option value="1">Muy pequeño</option>
          <option value="2">Pequeño</option>
          <option value="3">Normal</option>
          <option value="4">Mediano</option>
          <option value="5">Grande</option>
          <option value="6">Muy grande</option>
          <option value="7">Enorme</option>
        </select>
        <Divider />
        <ToolBtn onClick={() => exec("justifyLeft")} title="Alinear izquierda">
          <AlignLeft size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Centrar">
          <AlignCenter size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Alinear derecha">
          <AlignRight size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("justifyFull")} title="Justificar">
          <AlignJustify size={16} />
        </ToolBtn>
        <Divider />
        <ToolBtn
          onClick={() => exec("insertUnorderedList")}
          title="Lista con viñetas"
        >
          <List size={16} />
        </ToolBtn>
        <ToolBtn
          onClick={() => exec("insertOrderedList")}
          title="Lista numerada"
        >
          <ListOrdered size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("outdent")} title="Reducir sangría">
          <IndentDecrease size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("indent")} title="Aumentar sangría">
          <IndentIncrease size={16} />
        </ToolBtn>
        <Divider />
        <ToolBtn onClick={insertLink} title="Insertar enlace">
          <Link size={16} />
        </ToolBtn>
        <ToolBtn onClick={insertTable} title="Insertar tabla">
          <Table size={16} />
        </ToolBtn>
        <ToolBtn
          onClick={() => exec("insertHorizontalRule")}
          title="Línea horizontal"
        >
          <Minus size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("removeFormat")} title="Quitar formato">
          <RemoveFormatting size={16} />
        </ToolBtn>
        <Divider />
        <button
          type="button"
          title="Ver/editar código HTML"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setCodeView((v) => !v)}
          className={`h-8 px-2 inline-flex items-center gap-1 rounded text-xs transition-colors ${
            codeView
              ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
              : "hover:bg-[hsl(var(--secondary))]"
          }`}
        >
          <Code size={16} /> HTML
        </button>
      </div>

      {/* Área de edición */}
      {codeView ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[60vh] max-h-[80vh] p-4 font-mono text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] outline-none resize-y"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          className="prose prose-sm max-w-none p-6 bg-white text-black overflow-auto min-h-[60vh] max-h-[80vh] outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-inset"
        />
      )}
    </div>
  );
}
