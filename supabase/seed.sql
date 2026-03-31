-- ================================================
-- Seed: Templates de contrato para Feria Effix
-- Versión 2: soporte persona natural/jurídica,
--            internacional, sin variables de organizador
-- ================================================

-- Limpiar templates anteriores
DELETE FROM contract_templates;

-- ================================================
-- Template 1: Contrato de Ponente
-- ================================================
INSERT INTO contract_templates (name, slug, description, content, variables) VALUES (
  'Contrato de Ponente',
  'ponente-effix',
  'Contrato de prestación de servicios para ponentes/speakers de la Feria Effix',
  '<div class="contract" style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8; color: #333;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="font-size: 24px; margin-bottom: 8px;">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
    <h2 style="font-size: 18px; color: #666;">PONENTE - FERIA EFFIX {{anio}}</h2>
  </div>

  <p>Entre los suscritos, a saber: <strong>{{org_nombre}}</strong>, identificado(a) con {{org_documento_tipo}} No. {{org_documento}}, actuando en calidad de representante legal de <strong>{{org_empresa}}</strong>, identificada con NIT {{org_nit}}, en adelante EL ORGANIZADOR; y

  {{#if empresa}}
  <strong>{{empresa}}</strong>, identificada con {{id_fiscal}}, representada en este acto por <strong>{{representante_legal}}</strong>, identificado(a) con {{tipo_documento_representante}} No. {{numero_documento_representante}}{{#if pais}}, de nacionalidad {{pais}}{{/if}},
  {{else}}
  <strong>{{nombre_completo}}</strong>, identificado(a) con {{tipo_documento}} No. {{numero_documento}}{{#if pais}}, de nacionalidad {{pais}}{{/if}},
  {{/if}}

  en adelante EL PONENTE, se celebra el presente contrato de prestación de servicios, el cual se regirá por las siguientes cláusulas:</p>

  <h3 style="margin-top: 30px;">CLÁUSULA PRIMERA - OBJETO</h3>
  <p>EL PONENTE se compromete a realizar una presentación/conferencia sobre el tema: <strong>"{{tema_charla}}"</strong>, en el marco de la Feria Effix {{anio}}, que se llevará a cabo en {{lugar_evento}}, el día {{fecha_charla}}.</p>

  <h3>CLÁUSULA SEGUNDA - OBLIGACIONES DEL PONENTE</h3>
  <p>EL PONENTE se obliga a:</p>
  <ol>
    <li>Presentarse en el lugar del evento el día {{fecha_charla}} a las {{hora_inicio}}, con una antelación mínima de 30 minutos.</li>
    <li>Realizar la presentación en el horario acordado: de {{hora_inicio}} a {{hora_fin}}.</li>
    <li>Entregar el material de presentación con al menos 48 horas de anticipación al evento.</li>
    <li>Cumplir con las normas y reglamentos establecidos por EL ORGANIZADOR para el evento.</li>
  </ol>

  <h3>CLÁUSULA TERCERA - CONTRAPRESTACIÓN</h3>
  <p>EL ORGANIZADOR pagará a EL PONENTE la suma de <strong>{{honorarios}} {{moneda}}</strong> ({{honorarios_letras}}), por concepto de honorarios por la prestación del servicio descrito. El pago se realizará de la siguiente manera: {{forma_pago}}.</p>

  <h3>CLÁUSULA CUARTA - PROPIEDAD INTELECTUAL</h3>
  <p>EL PONENTE autoriza a EL ORGANIZADOR a grabar, fotografiar y transmitir la presentación por medios digitales, así como a utilizar el material para fines promocionales del evento.</p>

  <h3>CLÁUSULA QUINTA - CONFIDENCIALIDAD</h3>
  <p>Las partes se comprometen a mantener confidencialidad sobre los términos económicos del presente contrato.</p>

  <h3>CLÁUSULA SEXTA - CANCELACIÓN</h3>
  <p>En caso de cancelación por parte de EL PONENTE con menos de 15 días de anticipación, este deberá reembolsar cualquier anticipo recibido. Si la cancelación es por parte de EL ORGANIZADOR, se pagará al PONENTE el 50% de los honorarios acordados.</p>

  <h3>CLÁUSULA SÉPTIMA - LEGISLACIÓN APLICABLE</h3>
  <p>El presente contrato se rige por las leyes de la República de Colombia.</p>

  <p style="margin-top: 40px;">Para constancia se firma electrónicamente en la fecha indicada, de conformidad con la Ley 527 de 1999 y el Decreto 2364 de 2012.</p>

  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div style="width: 45%;">
      <p style="border-top: 1px solid #333; padding-top: 8px;"><strong>EL ORGANIZADOR</strong></p>
      <p>{{org_nombre}}</p>
      <p>{{org_documento_tipo}} {{org_documento}}</p>
      <p>{{org_empresa}}</p>
    </div>
    <div style="width: 45%;">
      <p style="border-top: 1px solid #333; padding-top: 8px;"><strong>EL PONENTE</strong></p>
      {{#if empresa}}
      <p>{{representante_legal}}</p>
      <p>{{tipo_documento_representante}} {{numero_documento_representante}}</p>
      <p>{{empresa}} &mdash; {{id_fiscal}}</p>
      {{else}}
      <p>{{nombre_completo}}</p>
      <p>{{tipo_documento}} {{numero_documento}}</p>
      {{#if pais}}<p>Nacionalidad: {{pais}}</p>{{/if}}
      {{/if}}
      <div id="signature-placeholder" style="min-height: 80px; border: 1px dashed #ccc; margin-top: 10px; display: flex; align-items: center; justify-content: center; color: #999;">
        [Firma electrónica]
      </div>
    </div>
  </div>
</div>',
  '[
    {"key": "tipo_persona", "label": "Tipo de persona", "type": "select", "required": true, "options": ["Persona Natural", "Persona Jurídica"]},
    {"key": "nombre_completo", "label": "Nombre completo (persona natural)", "type": "text", "required": false, "placeholder": "Juan García López"},
    {"key": "tipo_documento", "label": "Tipo de documento (persona natural)", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento", "label": "Número de documento (persona natural)", "type": "text", "required": false},
    {"key": "empresa", "label": "Razón social (persona jurídica)", "type": "text", "required": false, "placeholder": "Empresa SAS"},
    {"key": "id_fiscal", "label": "ID fiscal / NIT (persona jurídica)", "type": "text", "required": false, "placeholder": "NIT 900.123.456-7"},
    {"key": "representante_legal", "label": "Nombre del representante legal (persona jurídica)", "type": "text", "required": false},
    {"key": "tipo_documento_representante", "label": "Tipo documento del representante", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento_representante", "label": "Número documento del representante", "type": "text", "required": false},
    {"key": "pais", "label": "País / Nacionalidad (si es extranjero)", "type": "text", "required": false, "placeholder": "México"},
    {"key": "tema_charla", "label": "Tema de la charla", "type": "text", "required": true},
    {"key": "fecha_charla", "label": "Fecha de la charla", "type": "date", "required": true},
    {"key": "hora_inicio", "label": "Hora de inicio", "type": "text", "required": true, "placeholder": "09:00 AM"},
    {"key": "hora_fin", "label": "Hora de fin", "type": "text", "required": true, "placeholder": "10:30 AM"},
    {"key": "honorarios", "label": "Honorarios (valor)", "type": "text", "required": true, "placeholder": "2.000.000"},
    {"key": "honorarios_letras", "label": "Honorarios en letras", "type": "text", "required": true, "placeholder": "Dos millones de pesos colombianos"},
    {"key": "moneda", "label": "Moneda", "type": "select", "required": true, "options": ["COP", "USD", "EUR"]},
    {"key": "forma_pago", "label": "Forma de pago", "type": "textarea", "required": true, "placeholder": "50% anticipado, 50% post-evento"},
    {"key": "lugar_evento", "label": "Lugar del evento", "type": "text", "required": true, "placeholder": "Centro de Convenciones, Bogotá"},
    {"key": "anio", "label": "Año del evento", "type": "text", "required": true, "placeholder": "2026"}
  ]'::jsonb
);

-- ================================================
-- Template 2: Contrato de Stand/Expositor
-- ================================================
INSERT INTO contract_templates (name, slug, description, content, variables) VALUES (
  'Contrato de Stand/Expositor',
  'stand-effix',
  'Contrato de arrendamiento de espacio para expositores/stands en la Feria Effix',
  '<div class="contract" style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8; color: #333;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="font-size: 24px; margin-bottom: 8px;">CONTRATO DE ARRENDAMIENTO DE ESPACIO</h1>
    <h2 style="font-size: 18px; color: #666;">STAND EXPOSITOR - FERIA EFFIX {{anio}}</h2>
  </div>

  <p>Entre los suscritos: <strong>{{org_nombre}}</strong>, identificado(a) con {{org_documento_tipo}} No. {{org_documento}}, representante legal de <strong>{{org_empresa}}</strong>, NIT {{org_nit}}, en adelante EL ORGANIZADOR; y

  {{#if empresa}}
  <strong>{{empresa}}</strong>, identificada con {{id_fiscal}}, representada en este acto por <strong>{{representante_legal}}</strong>, identificado(a) con {{tipo_documento_representante}} No. {{numero_documento_representante}}{{#if pais}}, de nacionalidad {{pais}}{{/if}},
  {{else}}
  <strong>{{nombre_completo}}</strong>, identificado(a) con {{tipo_documento}} No. {{numero_documento}}{{#if pais}}, de nacionalidad {{pais}}{{/if}},
  {{/if}}

  en adelante EL EXPOSITOR, acuerdan:</p>

  <h3 style="margin-top: 30px;">CLÁUSULA PRIMERA - OBJETO</h3>
  <p>EL ORGANIZADOR concede a EL EXPOSITOR el uso del espacio denominado <strong>Stand {{numero_stand}}</strong>, ubicado en {{ubicacion}}, con un área de <strong>{{metros_cuadrados}} metros cuadrados</strong>, durante la realización de la Feria Effix {{anio}} en {{lugar_evento}}.</p>

  <h3>CLÁUSULA SEGUNDA - VIGENCIA</h3>
  <p>El presente contrato tendrá vigencia desde la fecha de montaje ({{fecha_montaje}}) hasta la fecha de desmontaje ({{fecha_desmontaje}}). El evento se realizará los días {{fechas_evento}}.</p>

  <h3>CLÁUSULA TERCERA - VALOR Y FORMA DE PAGO</h3>
  <p>El valor total del arrendamiento del espacio es de <strong>{{valor_stand}} {{moneda}}</strong> ({{valor_stand_letras}}). El pago se realizará de la siguiente manera: {{forma_pago}}.</p>

  <h3>CLÁUSULA CUARTA - OBLIGACIONES DEL EXPOSITOR</h3>
  <ol>
    <li>Realizar el montaje del stand en las fechas y horarios indicados por EL ORGANIZADOR.</li>
    <li>Mantener el stand en óptimas condiciones durante todo el evento.</li>
    <li>Cumplir con las normas de seguridad y convivencia del recinto.</li>
    <li>Desmontar y desocupar el espacio en la fecha establecida ({{fecha_desmontaje}}).</li>
    <li>No ceder ni subarrendar el espacio asignado sin autorización escrita.</li>
    <li>Contar con todos los permisos y licencias requeridos para los productos/servicios exhibidos.</li>
  </ol>

  <h3>CLÁUSULA QUINTA - OBLIGACIONES DEL ORGANIZADOR</h3>
  <ol>
    <li>Entregar el espacio en las condiciones acordadas.</li>
    <li>Proveer servicios básicos: energía eléctrica (110V), iluminación general y señalización.</li>
    <li>Garantizar seguridad general del recinto durante el horario del evento.</li>
    <li>Realizar la promoción general del evento.</li>
  </ol>

  <h3>CLÁUSULA SEXTA - SERVICIOS ADICIONALES</h3>
  <p>{{servicios_adicionales}}</p>

  <h3>CLÁUSULA SÉPTIMA - RESPONSABILIDAD</h3>
  <p>EL EXPOSITOR será responsable de sus equipos, mercancía y personal. EL ORGANIZADOR no se hace responsable por pérdidas, daños o hurtos de los bienes del EXPOSITOR.</p>

  <h3>CLÁUSULA OCTAVA - CANCELACIÓN</h3>
  <p>En caso de cancelación por EL EXPOSITOR: con más de 30 días, se reembolsa el 80%; entre 15-30 días, el 50%; menos de 15 días, no hay reembolso. Cancelación por EL ORGANIZADOR: reembolso total.</p>

  <h3>CLÁUSULA NOVENA - LEGISLACIÓN</h3>
  <p>Este contrato se rige por las leyes de Colombia. Para cualquier controversia, las partes acuerdan someterse a la jurisdicción de los jueces de {{ciudad_jurisdiccion}}.</p>

  <p style="margin-top: 40px;">Firmado electrónicamente conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012.</p>

  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div style="width: 45%;">
      <p style="border-top: 1px solid #333; padding-top: 8px;"><strong>EL ORGANIZADOR</strong></p>
      <p>{{org_nombre}}</p>
      <p>{{org_documento_tipo}} {{org_documento}}</p>
      <p>{{org_empresa}}</p>
    </div>
    <div style="width: 45%;">
      <p style="border-top: 1px solid #333; padding-top: 8px;"><strong>EL EXPOSITOR</strong></p>
      {{#if empresa}}
      <p>{{representante_legal}}</p>
      <p>{{tipo_documento_representante}} {{numero_documento_representante}}</p>
      <p>{{empresa}} &mdash; {{id_fiscal}}</p>
      {{else}}
      <p>{{nombre_completo}}</p>
      <p>{{tipo_documento}} {{numero_documento}}</p>
      {{#if pais}}<p>Nacionalidad: {{pais}}</p>{{/if}}
      {{/if}}
      <div id="signature-placeholder" style="min-height: 80px; border: 1px dashed #ccc; margin-top: 10px; display: flex; align-items: center; justify-content: center; color: #999;">
        [Firma electrónica]
      </div>
    </div>
  </div>
</div>',
  '[
    {"key": "tipo_persona", "label": "Tipo de persona", "type": "select", "required": true, "options": ["Persona Natural", "Persona Jurídica"]},
    {"key": "nombre_completo", "label": "Nombre completo (persona natural)", "type": "text", "required": false, "placeholder": "Juan García López"},
    {"key": "tipo_documento", "label": "Tipo de documento (persona natural)", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento", "label": "Número de documento (persona natural)", "type": "text", "required": false},
    {"key": "empresa", "label": "Razón social (persona jurídica)", "type": "text", "required": false, "placeholder": "Empresa SAS"},
    {"key": "id_fiscal", "label": "ID fiscal / NIT (persona jurídica)", "type": "text", "required": false, "placeholder": "NIT 900.123.456-7"},
    {"key": "representante_legal", "label": "Nombre del representante legal (persona jurídica)", "type": "text", "required": false},
    {"key": "tipo_documento_representante", "label": "Tipo documento del representante", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento_representante", "label": "Número documento del representante", "type": "text", "required": false},
    {"key": "pais", "label": "País / Nacionalidad (si es extranjero)", "type": "text", "required": false, "placeholder": "México"},
    {"key": "numero_stand", "label": "Número de stand", "type": "text", "required": true, "placeholder": "A-15"},
    {"key": "metros_cuadrados", "label": "Metros cuadrados", "type": "number", "required": true, "placeholder": "9"},
    {"key": "ubicacion", "label": "Ubicación del stand", "type": "text", "required": true, "placeholder": "Pabellón A, Pasillo 3"},
    {"key": "valor_stand", "label": "Valor del stand (monto)", "type": "text", "required": true},
    {"key": "valor_stand_letras", "label": "Valor en letras", "type": "text", "required": true},
    {"key": "moneda", "label": "Moneda", "type": "select", "required": true, "options": ["COP", "USD", "EUR"]},
    {"key": "forma_pago", "label": "Forma de pago", "type": "textarea", "required": true},
    {"key": "fecha_montaje", "label": "Fecha de montaje", "type": "date", "required": true},
    {"key": "fecha_desmontaje", "label": "Fecha de desmontaje", "type": "date", "required": true},
    {"key": "fechas_evento", "label": "Fechas del evento", "type": "text", "required": true},
    {"key": "lugar_evento", "label": "Lugar del evento", "type": "text", "required": true},
    {"key": "servicios_adicionales", "label": "Servicios adicionales incluidos", "type": "textarea", "required": false, "placeholder": "WiFi dedicado, conexión eléctrica 220V, mobiliario básico"},
    {"key": "ciudad_jurisdiccion", "label": "Ciudad de jurisdicción", "type": "text", "required": true, "placeholder": "Bogotá D.C."},
    {"key": "anio", "label": "Año del evento", "type": "text", "required": true, "placeholder": "2026"}
  ]'::jsonb
);

-- ================================================
-- Template 3: Contrato de Patrocinador
-- ================================================
INSERT INTO contract_templates (name, slug, description, content, variables) VALUES (
  'Contrato de Patrocinador',
  'patrocinador-effix',
  'Contrato de patrocinio para la Feria Effix',
  '<div class="contract" style="font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.8; color: #333;">
  <div style="text-align: center; margin-bottom: 40px;">
    <h1 style="font-size: 24px; margin-bottom: 8px;">CONTRATO DE PATROCINIO</h1>
    <h2 style="font-size: 18px; color: #666;">FERIA EFFIX {{anio}}</h2>
  </div>

  <p>Entre: <strong>{{org_nombre}}</strong>, {{org_documento_tipo}} No. {{org_documento}}, representante legal de <strong>{{org_empresa}}</strong>, NIT {{org_nit}} (EL ORGANIZADOR); y

  {{#if empresa}}
  <strong>{{empresa}}</strong>, identificada con {{id_fiscal}}, representada en este acto por <strong>{{representante_legal}}</strong>, identificado(a) con {{tipo_documento_representante}} No. {{numero_documento_representante}}{{#if pais}}, de nacionalidad {{pais}}{{/if}},
  {{else}}
  <strong>{{nombre_completo}}</strong>, identificado(a) con {{tipo_documento}} No. {{numero_documento}}{{#if pais}}, de nacionalidad {{pais}}{{/if}},
  {{/if}}

  (EL PATROCINADOR), se celebra el presente contrato de patrocinio:</p>

  <h3 style="margin-top: 30px;">CLÁUSULA PRIMERA - OBJETO</h3>
  <p>EL PATROCINADOR se vincula a la Feria Effix {{anio}} en calidad de <strong>Patrocinador {{tipo_patrocinio}}</strong>, aportando los recursos económicos o en especie acordados, a cambio de los beneficios de visibilidad y posicionamiento descritos en este contrato.</p>

  <h3>CLÁUSULA SEGUNDA - VALOR DEL PATROCINIO</h3>
  <p>El valor total del patrocinio es de <strong>{{valor_patrocinio}} {{moneda}}</strong> ({{valor_patrocinio_letras}}). Forma de pago: {{forma_pago}}.</p>

  <h3>CLÁUSULA TERCERA - BENEFICIOS PARA EL PATROCINADOR</h3>
  <p>EL ORGANIZADOR otorgará los siguientes beneficios:</p>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 15px 0;">
    {{beneficios}}
  </div>

  <h3>CLÁUSULA CUARTA - OBLIGACIONES DEL ORGANIZADOR</h3>
  <ol>
    <li>Incluir la marca del PATROCINADOR en toda la pauta publicitaria del evento según el nivel de patrocinio.</li>
    <li>Entregar reporte post-evento con métricas de alcance y exposición de marca.</li>
    <li>Cumplir con todos los beneficios acordados en la Cláusula Tercera.</li>
  </ol>

  <h3>CLÁUSULA QUINTA - OBLIGACIONES DEL PATROCINADOR</h3>
  <ol>
    <li>Realizar los pagos en los plazos establecidos.</li>
    <li>Entregar materiales de marca (logos, banners) con mínimo 15 días de anticipación.</li>
    <li>No realizar actividades que perjudiquen la imagen del evento.</li>
  </ol>

  <h3>CLÁUSULA SEXTA - EXCLUSIVIDAD</h3>
  <p>{{clausula_exclusividad}}</p>

  <h3>CLÁUSULA SÉPTIMA - CANCELACIÓN</h3>
  <p>En caso de cancelación por EL PATROCINADOR: con más de 45 días, reembolso del 70%; entre 15-45 días, reembolso del 30%; menos de 15 días, sin reembolso. Si el evento es cancelado por fuerza mayor, se reembolsará el 100%.</p>

  <h3>CLÁUSULA OCTAVA - LEGISLACIÓN</h3>
  <p>Este contrato se rige por las leyes de la República de Colombia.</p>

  <p style="margin-top: 40px;">Firmado electrónicamente conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012.</p>

  <div style="margin-top: 60px; display: flex; justify-content: space-between;">
    <div style="width: 45%;">
      <p style="border-top: 1px solid #333; padding-top: 8px;"><strong>EL ORGANIZADOR</strong></p>
      <p>{{org_nombre}}</p>
      <p>{{org_documento_tipo}} {{org_documento}}</p>
      <p>{{org_empresa}}</p>
    </div>
    <div style="width: 45%;">
      <p style="border-top: 1px solid #333; padding-top: 8px;"><strong>EL PATROCINADOR</strong></p>
      {{#if empresa}}
      <p>{{representante_legal}}</p>
      <p>{{tipo_documento_representante}} {{numero_documento_representante}}</p>
      <p>{{empresa}} &mdash; {{id_fiscal}}</p>
      {{else}}
      <p>{{nombre_completo}}</p>
      <p>{{tipo_documento}} {{numero_documento}}</p>
      {{#if pais}}<p>Nacionalidad: {{pais}}</p>{{/if}}
      {{/if}}
      <div id="signature-placeholder" style="min-height: 80px; border: 1px dashed #ccc; margin-top: 10px; display: flex; align-items: center; justify-content: center; color: #999;">
        [Firma electrónica]
      </div>
    </div>
  </div>
</div>',
  '[
    {"key": "tipo_persona", "label": "Tipo de persona", "type": "select", "required": true, "options": ["Persona Natural", "Persona Jurídica"]},
    {"key": "nombre_completo", "label": "Nombre completo (persona natural)", "type": "text", "required": false, "placeholder": "Juan García López"},
    {"key": "tipo_documento", "label": "Tipo de documento (persona natural)", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento", "label": "Número de documento (persona natural)", "type": "text", "required": false},
    {"key": "empresa", "label": "Razón social (persona jurídica)", "type": "text", "required": false, "placeholder": "Empresa SAS"},
    {"key": "id_fiscal", "label": "ID fiscal / NIT (persona jurídica)", "type": "text", "required": false, "placeholder": "NIT 900.123.456-7"},
    {"key": "representante_legal", "label": "Nombre del representante legal (persona jurídica)", "type": "text", "required": false},
    {"key": "tipo_documento_representante", "label": "Tipo documento del representante", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento_representante", "label": "Número documento del representante", "type": "text", "required": false},
    {"key": "pais", "label": "País / Nacionalidad (si es extranjero)", "type": "text", "required": false, "placeholder": "México"},
    {"key": "tipo_patrocinio", "label": "Tipo de patrocinio", "type": "select", "required": true, "options": ["Diamante", "Oro", "Plata", "Bronce"]},
    {"key": "valor_patrocinio", "label": "Valor del patrocinio (monto)", "type": "text", "required": true},
    {"key": "valor_patrocinio_letras", "label": "Valor en letras", "type": "text", "required": true},
    {"key": "moneda", "label": "Moneda", "type": "select", "required": true, "options": ["COP", "USD", "EUR"]},
    {"key": "forma_pago", "label": "Forma de pago", "type": "textarea", "required": true},
    {"key": "beneficios", "label": "Beneficios del patrocinio", "type": "textarea", "required": true, "placeholder": "- Logo en banner principal\n- 2 stands de 9m2\n- 5 entradas VIP\n- Mención en redes sociales"},
    {"key": "clausula_exclusividad", "label": "Cláusula de exclusividad", "type": "textarea", "required": false, "placeholder": "El PATROCINADOR tendrá exclusividad en la categoría de..."},
    {"key": "anio", "label": "Año del evento", "type": "text", "required": true, "placeholder": "2026"}
  ]'::jsonb
);
