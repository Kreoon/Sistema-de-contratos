/**
 * Tipos para el bundle de navegador de mammoth (`mammoth/mammoth.browser`).
 * El paquete solo publica tipos para su entrada de Node, que además depende de
 * `Buffer`; en el navegador usamos el bundle standalone con `arrayBuffer`.
 */
declare module "mammoth/mammoth.browser" {
  export interface ConversionMessage {
    type: "warning" | "error" | string;
    message: string;
  }

  export interface ConversionResult {
    value: string;
    messages: ConversionMessage[];
  }

  export interface ConvertOptions {
    styleMap?: string | string[];
    includeDefaultStyleMap?: boolean;
    ignoreEmptyParagraphs?: boolean;
    convertImage?: unknown;
  }

  export interface MammothBrowser {
    convertToHtml(
      input: { arrayBuffer: ArrayBuffer },
      options?: ConvertOptions,
    ): Promise<ConversionResult>;
    extractRawText(input: {
      arrayBuffer: ArrayBuffer;
    }): Promise<ConversionResult>;
    images: {
      /**
       * Construye el conversor de imágenes. Si la función no llama a
       * `image.read()`, los binarios no se leen.
       */
      imgElement(
        build: (image: unknown) => Record<string, string>,
      ): ConvertOptions["convertImage"];
    };
  }

  const mammoth: MammothBrowser;
  export default mammoth;
}
