-- ================================================
-- Seed: Templates de contrato para Feria Effix
-- Versión 3: lenguaje legal exacto de los contratos
--            originales EFFIX SAS
-- ================================================

DELETE FROM contract_templates;

-- ================================================
-- Template 1: Contrato de Ponente (Prestación de Servicios)
-- ================================================
INSERT INTO contract_templates (name, slug, description, content, variables) VALUES (
  'Contrato de Ponente',
  'ponente-effix',
  'Contrato de prestación de servicios para ponentes/speakers de la Feria Effix',
  '<div style="font-family: Georgia, serif; max-width: 820px; margin: 0 auto; padding: 48px 56px; line-height: 1.9; color: #1a1a1a; font-size: 14px;">

  <div style="text-align: center; margin-bottom: 48px; border-bottom: 2px solid #1a1a1a; padding-bottom: 32px;">
    <h1 style="font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 0 0 8px 0; text-transform: uppercase;">CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
    <h2 style="font-size: 16px; font-weight: normal; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">FERIA EFFIX {{anio}}</h2>
  </div>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">GENERALIDADES</h3>

  <p style="text-align: justify; margin-bottom: 16px;">La Feria Effix es el evento de comercio electrónico MÁS GRANDE DEL MUNDO y tendrá lugar en las instalaciones de Plaza Mayor Medellín, Colombia, del 16 al 18 de octubre de {{anio}}, reuniendo a los líderes, emprendedores, marcas y empresas más importantes del ecosistema digital de habla hispana.</p>

  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato de prestación de servicios se celebra entre:</p>

  <p style="text-align: justify; margin-bottom: 16px;"><strong>EL CONTRATANTE:</strong> <strong>{{org_empresa}}</strong>, identificada con NIT {{org_nit}}, representada en este acto por <strong>{{org_nombre}}</strong>, identificado(a) con {{org_documento}}, en su calidad de Representante Legal, con dirección {{org_direccion}}, ciudad de {{org_ciudad}}, correo electrónico {{org_email}}, teléfono {{org_telefono}}. En adelante denominado <strong>EL CONTRATANTE</strong>.</p>

  {{#if empresa}}
  <p style="text-align: justify; margin-bottom: 24px;"><strong>EL CONTRATISTA:</strong> <strong>{{empresa}}</strong>, identificada con {{id_fiscal}}, representada en este acto por <strong>{{representante_legal}}</strong>, identificado(a) con {{tipo_documento_representante}} No. {{numero_documento_representante}}{{#if pais}}, de nacionalidad {{pais}}{{/if}}, correo electrónico {{email_contratista}}, teléfono {{telefono_contratista}}. En adelante denominado <strong>EL CONTRATISTA</strong>.</p>
  {{else}}
  <p style="text-align: justify; margin-bottom: 24px;"><strong>EL CONTRATISTA:</strong> <strong>{{nombre_completo}}</strong>, identificado(a) con {{tipo_documento}} No. {{numero_documento}}{{#if pais}}, de nacionalidad {{pais}}{{/if}}, correo electrónico {{email_contratista}}, teléfono {{telefono_contratista}}. En adelante denominado <strong>EL CONTRATISTA</strong>.</p>
  {{/if}}

  <p style="text-align: justify; margin-bottom: 24px;">Las partes, de común acuerdo, han decidido celebrar el presente Contrato de Prestación de Servicios, el cual se regirá por las siguientes cláusulas:</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">PRIMERA. OBJETO</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONTRATISTA se compromete a realizar una conferencia de carácter académico, técnico, personal y/o profesional en el marco de la Feria Effix {{anio}}, que se llevará a cabo en {{org_lugar_evento}}.</p>
  <p style="text-align: justify; margin-bottom: 24px;"><strong>Parágrafo:</strong> La fecha y hora exacta de la conferencia será acordada entre las partes con posterioridad a la firma del presente contrato, y comunicada al CONTRATISTA con la debida antelación.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SEGUNDA. OBLIGACIONES DEL CONTRATISTA</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONTRATISTA se obliga a:</p>
  <ol style="text-align: justify; padding-left: 24px; margin-bottom: 12px;">
    <li style="margin-bottom: 8px;">Enviar una fotografía profesional para efectos de difusión y comunicación del evento.</li>
    <li style="margin-bottom: 8px;">Preparar y desarrollar su presentación de manera óptima para el público asistente.</li>
    <li style="margin-bottom: 8px;">Atender las preguntas del público durante el tiempo asignado para tal fin.</li>
    <li style="margin-bottom: 8px;">Remitir el material de presentación al CONTRATANTE con la debida antelación, conforme a las instrucciones que se le impartan.</li>
    <li style="margin-bottom: 8px;">Podrá apoyar voluntariamente en otras actividades del evento, sin que ello genere obligación adicional de remuneración.</li>
    <li style="margin-bottom: 8px;">Informar al CONTRATANTE, con un mínimo de cinco (5) días hábiles de anticipación, cualquier circunstancia que le impida asistir al evento.</li>
    <li style="margin-bottom: 8px;">Dispensar un trato respetuoso y cordial al equipo organizador, al público y a los demás participantes del evento.</li>
    <li style="margin-bottom: 8px;">Abstenerse de realizar publicidad comercial de sus productos o servicios durante su intervención, sin autorización previa y escrita del CONTRATANTE. Sin perjuicio de lo anterior, al cierre de su presentación podrá compartir su nombre y redes sociales personales o profesionales.</li>
    <li style="margin-bottom: 8px;">Ser puntual en el horario asignado para su conferencia.</li>
  </ol>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">TERCERA. OBLIGACIONES DEL CONTRATANTE</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONTRATANTE se obliga a:</p>
  <ol style="text-align: justify; padding-left: 24px; margin-bottom: 12px;">
    <li style="margin-bottom: 8px;">Prestar la colaboración necesaria para el adecuado cumplimiento del objeto contractual.</li>
    <li style="margin-bottom: 8px;">Suministrar las plantillas de presentación oficiales del evento.</li>
    <li style="margin-bottom: 8px;">Ofrecer al CONTRATISTA hasta dos (2) sesiones de capacitación formativas de carácter voluntario, sin costo adicional.</li>
    <li style="margin-bottom: 8px;">Cumplir con la remuneración pactada en los términos y condiciones establecidos en el presente contrato.</li>
  </ol>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">CUARTA. REMUNERACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 12px;">Como contraprestación por los servicios objeto del presente contrato, EL CONTRATANTE pagará a EL CONTRATISTA la suma de <strong>{{honorarios}} {{moneda}}</strong> ({{honorarios_letras}}).</p>
  {{#if forma_pago}}
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Forma de pago:</strong> {{forma_pago}}</p>
  {{/if}}
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Parágrafo 1:</strong> EL CONTRATANTE no iniciará el proceso de pago del segundo desembolso sin antes haber verificado su efectivo recibo. El CONTRATISTA deberá confirmar la recepción del pago correspondiente.</p>
  <p style="text-align: justify; margin-bottom: 24px;"><strong>Parágrafo 2:</strong> En caso de incumplimiento de las obligaciones por parte de EL CONTRATISTA, EL CONTRATANTE podrá dar por terminado unilateralmente el presente contrato y retener los valores pagados a título de cláusula penal, sin perjuicio de las acciones legales a que haya lugar.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">QUINTA. INASISTENCIA JUSTIFICADA</h3>
  <p style="text-align: justify; margin-bottom: 12px;">Si EL CONTRATISTA no pudiere cumplir con su obligación de participar en el evento por causa de fuerza mayor o caso fortuito debidamente acreditado, deberá comunicarlo al CONTRATANTE con un mínimo de cinco (5) días hábiles de anticipación a la fecha del evento.</p>
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Parágrafo 1:</strong> En caso de inasistencia justificada, EL CONTRATISTA deberá devolver el anticipo recibido dentro de los cinco (5) días hábiles siguientes a la comunicación de la inasistencia.</p>
  <p style="text-align: justify; margin-bottom: 24px;"><strong>Parágrafo 2:</strong> EL CONTRATISTA se compromete a grabar un video breve explicando su inasistencia, el cual deberá ser remitido al CONTRATANTE con un mínimo de veinticuatro (24) horas de anterioridad al evento, para efectos de comunicación con los asistentes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SEXTA. DURACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato tendrá vigencia desde la fecha de su suscripción y hasta la culminación de la participación del CONTRATISTA en el evento, conforme al objeto pactado.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SÉPTIMA. PROPIEDAD INTELECTUAL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONTRATISTA conserva los derechos morales sobre los contenidos de su presentación. No obstante, cede a EL CONTRATANTE los derechos patrimoniales de autor sobre los materiales generados en el marco de la ejecución del presente contrato, para efectos de promoción, difusión comercial y archivo institucional del evento, sin limitación de tiempo ni de territorio.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">OCTAVA. USO DE IMAGEN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONTRATISTA autoriza expresamente a EL CONTRATANTE para grabar, fotografiar y/o reproducir fragmentos de su participación en el evento, y para utilizar dichos contenidos en los canales oficiales de comunicación del CONTRATANTE, de forma gratuita, tanto a nivel nacional como internacional, sin limitación de tiempo.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">NOVENA. TRATAMIENTO DE INFORMACIÓN PERSONAL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Los datos personales suministrados por EL CONTRATISTA serán tratados conforme a lo dispuesto en la Ley 1581 de 2012 y el Decreto 1377 de 2013, o las normas que los sustituyan, modifiquen o complementen. EL CONTRATANTE garantiza la confidencialidad y el uso adecuado de dicha información.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA. FIRMA ELECTRÓNICA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Las partes aceptan que el presente contrato podrá ser suscrito mediante firma electrónica, de conformidad con lo establecido en la Ley 527 de 1999 y sus decretos reglamentarios, la cual tendrá plena validez y eficacia jurídica.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA PRIMERA. CESIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Ninguna de las partes podrá ceder los derechos u obligaciones derivados del presente contrato sin la autorización previa y escrita de la otra parte.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SEGUNDA. NOTIFICACIONES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Para todos los efectos legales y contractuales, las partes fijan como canales de notificación los siguientes: EL CONTRATANTE recibirá comunicaciones en el correo electrónico gerencia@feriaeffix.com y/o al teléfono 320 6556725. EL CONTRATISTA recibirá comunicaciones en el correo electrónico {{email_contratista}} y/o al teléfono {{telefono_contratista}}.</p>

  <p style="text-align: justify; margin-top: 40px; margin-bottom: 40px;">En constancia de lo anterior, las partes suscriben el presente contrato de forma electrónica, de conformidad con la Ley 527 de 1999, en la fecha indicada en el sistema de firma electrónica.</p>

  <div style="margin-top: 64px; display: flex; justify-content: space-between; gap: 40px;">
    <div style="width: 45%;">
      <img src="/firma-omar-stevenson.png" alt="Firma Omar Stevenson Rivera" style="max-height: 80px; max-width: 200px; margin-bottom: 4px;" />
      <div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">
        <p style="margin: 0 0 4px 0; font-weight: bold;">EL CONTRATANTE</p>
        <p style="margin: 0 0 4px 0;">{{org_nombre}}</p>
        <p style="margin: 0 0 4px 0;">{{org_documento}}</p>
        <p style="margin: 0 0 4px 0;">{{org_empresa}}</p>
        <p style="margin: 0 0 4px 0;">NIT: {{org_nit}}</p>
        <p style="margin: 0 0 4px 0;">{{org_ciudad}}</p>
      </div>
    </div>
    <div style="width: 45%;">
      <div style="min-height: 72px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 4px;">
        [Firma electrónica]
      </div>
      <div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">
        <p style="margin: 0 0 4px 0; font-weight: bold;">EL CONTRATISTA</p>
        {{#if empresa}}
        <p style="margin: 0 0 4px 0;">{{representante_legal}}</p>
        <p style="margin: 0 0 4px 0;">{{tipo_documento_representante}} No. {{numero_documento_representante}}</p>
        <p style="margin: 0 0 4px 0;">{{empresa}}</p>
        <p style="margin: 0 0 4px 0;">{{id_fiscal}}</p>
        {{else}}
        <p style="margin: 0 0 4px 0;">{{nombre_completo}}</p>
        <p style="margin: 0 0 4px 0;">{{tipo_documento}} No. {{numero_documento}}</p>
        {{#if pais}}<p style="margin: 0 0 4px 0;">Nacionalidad: {{pais}}</p>{{/if}}
        {{/if}}
      </div>
    </div>
  </div>

</div>',
  '[
    {"key": "tipo_persona", "label": "Tipo de persona", "type": "select", "required": true, "options": ["Persona Natural", "Persona Jurídica"]},
    {"key": "nombre_completo", "label": "Nombre completo (persona natural)", "type": "text", "required": false, "placeholder": "Juan García López"},
    {"key": "tipo_documento", "label": "Tipo de documento (persona natural)", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento", "label": "Número de documento (persona natural)", "type": "text", "required": false},
    {"key": "pais", "label": "País / Nacionalidad", "type": "text", "required": false, "placeholder": "México"},
    {"key": "empresa", "label": "Razón social (persona jurídica)", "type": "text", "required": false, "placeholder": "Empresa SAS"},
    {"key": "id_fiscal", "label": "ID fiscal / NIT (persona jurídica)", "type": "text", "required": false, "placeholder": "NIT 900.123.456-7"},
    {"key": "representante_legal", "label": "Nombre del representante legal", "type": "text", "required": false},
    {"key": "tipo_documento_representante", "label": "Tipo documento del representante", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento_representante", "label": "Número documento del representante", "type": "text", "required": false},
    {"key": "email_contratista", "label": "Correo electrónico del contratista", "type": "text", "required": true, "placeholder": "ponente@ejemplo.com"},
    {"key": "telefono_contratista", "label": "Teléfono del contratista", "type": "text", "required": true, "placeholder": "+57 300 0000000"},
    {"key": "honorarios", "label": "Honorarios (valor numérico)", "type": "text", "required": true, "placeholder": "2.000.000"},
    {"key": "honorarios_letras", "label": "Honorarios en letras", "type": "text", "required": true, "placeholder": "Dos millones de pesos colombianos M/CTE"},
    {"key": "moneda", "label": "Moneda", "type": "select", "required": true, "options": ["COP", "USD", "EUR"]},
    {"key": "forma_pago", "label": "Forma de pago", "type": "textarea", "required": true, "placeholder": "50% al momento de la firma del contrato y 50% a la finalización del evento"},
    {"key": "anio", "label": "Año del evento", "type": "text", "required": true, "placeholder": "2026"}
  ]'::jsonb
);

-- ================================================
-- Template 2: Contrato de Stand (Concesión de Espacios Físicos)
-- ================================================
INSERT INTO contract_templates (name, slug, description, content, variables) VALUES (
  'Contrato de Stand / Expositor',
  'stand-effix',
  'Contrato de concesión de espacios físicos para expositores de la Feria Effix',
  '<div style="font-family: Georgia, serif; max-width: 820px; margin: 0 auto; padding: 48px 56px; line-height: 1.9; color: #1a1a1a; font-size: 14px;">

  <div style="text-align: center; margin-bottom: 48px; border-bottom: 2px solid #1a1a1a; padding-bottom: 32px;">
    <h1 style="font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 0 0 8px 0; text-transform: uppercase;">CONTRATO DE CONCESIÓN DE ESPACIOS FÍSICOS</h1>
    <h2 style="font-size: 16px; font-weight: normal; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">FERIA EFFIX {{anio}}</h2>
  </div>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 16px;">INFORMACIÓN GENERAL DEL CONCESIONARIO</h3>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 35%;">Nombre / Razón social</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">
        {{#if empresa}}{{empresa}}{{else}}{{nombre_completo}}{{/if}}
      </td>
    </tr>
    {{#if sigla}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Sigla</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{sigla}}</td>
    </tr>
    {{/if}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">
        {{#if empresa}}NIT / ID Fiscal{{else}}Tipo y N.º Documento{{/if}}
      </td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">
        {{#if empresa}}{{id_fiscal}}{{else}}{{tipo_documento}} No. {{numero_documento}}{{/if}}
      </td>
    </tr>
    {{#if empresa}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Representante legal</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{representante_legal}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Documento representante</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{tipo_documento_representante}} No. {{numero_documento_representante}}</td>
    </tr>
    {{/if}}
    {{#if pais}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">País</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{pais}}</td>
    </tr>
    {{/if}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Dirección</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{direccion}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Ciudad / Departamento</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{ciudad}} / {{departamento}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Teléfono / Celular</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{telefono}} / {{celular}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Correo electrónico</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{email}}</td>
    </tr>
    {{#if web_redes}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Web / Redes sociales</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{web_redes}}</td>
    </tr>
    {{/if}}
    {{#if persona_encargada}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Persona encargada</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{persona_encargada}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Correo encargado(a)</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{email_encargada}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Celular encargado(a)</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{celular_encargada}}</td>
    </tr>
    {{/if}}
  </table>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 16px;">TÉRMINOS DE DURACIÓN</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 35%;">Montaje</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">14 y 15 de octubre de {{anio}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Evento</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">16, 17 y 18 de octubre de {{anio}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Desmontaje</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">19 de octubre de {{anio}}</td>
    </tr>
  </table>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 16px;">ÁREA ARRENDADA Y VALOR</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
    <thead>
      <tr style="background: #e5e7eb; color: #111;">
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Pabellón</th>
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">N.º Stand</th>
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Tamaño</th>
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Valor total (IVA incluido)</th>
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Valor abono</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px 12px;">{{pabellon}}</td>
        <td style="border: 1px solid #ccc; padding: 8px 12px;">{{numero_stand}}</td>
        <td style="border: 1px solid #ccc; padding: 8px 12px;">{{tamano_stand}}</td>
        <td style="border: 1px solid #ccc; padding: 8px 12px;"><strong>{{valor_total}} {{moneda}}</strong></td>
        <td style="border: 1px solid #ccc; padding: 8px 12px;"><strong>{{valor_abono}} {{moneda}}</strong></td>
      </tr>
    </tbody>
  </table>

  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato de concesión mercantil de espacio físico —el cual no constituye arrendamiento— se celebra entre <strong>EFFIX S.A.S.</strong>, identificada con NIT {{org_nit}}, representada por <strong>{{org_nombre}}</strong>, identificado(a) con {{org_documento}}, en adelante <strong>EL CONCEDENTE</strong>; y el titular identificado en la sección de Información General, en adelante <strong>EL CONCESIONARIO</strong>.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">CONSIDERACIONES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE ha suscrito contrato con Plaza Mayor Medellín Convenciones y Exposiciones S.A. para el uso de sus instalaciones durante el período del evento. En virtud de lo anterior, EL CONCESIONARIO conoce y acepta que las condiciones de uso del espacio físico están sujetas al reglamento interno de Plaza Mayor, cuyo Anexo 1 hace parte integral del presente contrato.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">PRIMERA. OBJETO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE otorga a EL CONCESIONARIO el uso temporal del espacio físico identificado como Stand No. {{numero_stand}}, ubicado en el Pabellón {{pabellon}}, con un área de {{tamano_stand}}, en las instalaciones de Plaza Mayor Medellín, para los fines exclusivos de exhibición y comercialización de los productos y/o servicios del CONCESIONARIO durante la Feria Effix {{anio}}.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SEGUNDA. OBLIGACIONES DEL CONCESIONARIO</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONCESIONARIO se obliga a:</p>
  <ol style="text-align: justify; padding-left: 24px; margin-bottom: 12px;">
    <li style="margin-bottom: 8px;">Usar el espacio concedido exclusivamente para los fines del objeto contractual.</li>
    <li style="margin-bottom: 8px;">Realizar el montaje del stand dentro de los horarios establecidos por EL CONCEDENTE para los días 14 y 15 de octubre de {{anio}}.</li>
    <li style="margin-bottom: 8px;">Mantener el stand en óptimas condiciones de presentación, aseo y funcionamiento durante todo el evento.</li>
    <li style="margin-bottom: 8px;">Cumplir con el reglamento interno de Plaza Mayor Medellín (Anexo 1) y el Manual del Expositor (Anexo 2), los cuales forman parte integral del presente contrato.</li>
    <li style="margin-bottom: 8px;">Desmontar y desocupar el espacio asignado a más tardar el 19 de octubre de {{anio}}, en los horarios que EL CONCEDENTE indique.</li>
    <li style="margin-bottom: 8px;">Contar con todos los permisos, licencias, registros sanitarios y autorizaciones legales requeridas para la exhibición y/o venta de sus productos o servicios.</li>
    <li style="margin-bottom: 8px;">No ceder, subarrendar ni transferir a ningún título el espacio asignado, sin autorización previa y escrita de EL CONCEDENTE.</li>
    <li style="margin-bottom: 8px;">Responder por los daños que cause al espacio físico, a las instalaciones del recinto o a terceros, con ocasión del montaje, uso o desmontaje del stand.</li>
    <li style="margin-bottom: 8px;">Cumplir con los horarios de atención al público establecidos por EL CONCEDENTE para los días del evento.</li>
    <li style="margin-bottom: 8px;">Contar con el personal necesario para la adecuada atención del stand durante los días del evento.</li>
    <li style="margin-bottom: 8px;">Disponer de manera adecuada los residuos generados en el stand, conforme a las normas ambientales y del recinto.</li>
    <li style="margin-bottom: 8px;">No instalar estructuras, elementos o materiales que superen los límites del espacio asignado o que puedan obstaculizar los pasillos, la circulación o la visibilidad de otros expositores.</li>
  </ol>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">TERCERA. RESPONSABILIDAD POR BIENES DE TERCEROS</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE no asume responsabilidad alguna por pérdida, hurto, deterioro o daño de los bienes, equipos, mercancías o elementos de EL CONCESIONARIO o de terceros que se encuentren en el espacio asignado, durante el montaje, el desarrollo del evento o el desmontaje. EL CONCESIONARIO deberá adoptar las medidas de seguridad que estime necesarias para la protección de sus bienes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">CUARTA. OBLIGACIONES DEL CONCEDENTE</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONCEDENTE se obliga a:</p>
  <ol style="text-align: justify; padding-left: 24px; margin-bottom: 12px;">
    <li style="margin-bottom: 8px;">Entregar el espacio asignado en las condiciones acordadas y en los plazos establecidos para el montaje.</li>
    <li style="margin-bottom: 8px;">Garantizar el acceso a los servicios básicos del recinto, conforme al contrato suscrito con Plaza Mayor Medellín.</li>
    <li style="margin-bottom: 8px;">Realizar la promoción y difusión general de la Feria Effix {{anio}} a través de los canales de comunicación del evento.</li>
    <li style="margin-bottom: 8px;">Brindar a EL CONCESIONARIO la información necesaria para el correcto cumplimiento de sus obligaciones.</li>
  </ol>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">QUINTA. INDEMNIDAD</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO mantendrá indemne a EL CONCEDENTE frente a cualquier reclamación, demanda, sanción o daño que se derive del incumplimiento de sus obligaciones legales, del daño a terceros o del uso inadecuado del espacio concedido.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SEXTA. FUERZA MAYOR</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando dicho incumplimiento sea consecuencia de un evento de fuerza mayor o caso fortuito, debidamente acreditado, que haga imposible el cumplimiento de las obligaciones asumidas. La parte afectada deberá notificar a la otra de inmediato y por escrito.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SÉPTIMA. DURACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato tendrá vigencia desde la fecha de su suscripción y hasta el 19 de octubre de {{anio}}, fecha en que deberá haberse efectuado el desmontaje total del stand.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">OCTAVA. REMUNERACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONCESIONARIO pagará a EL CONCEDENTE la suma de <strong>{{valor_total}} {{moneda}}</strong> ({{valor_stand_letras}}) como contraprestación por la concesión del espacio físico descrito en el presente contrato.</p>
  {{#if forma_pago}}
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Forma de pago:</strong> {{forma_pago}}</p>
  {{/if}}
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Parágrafo 1 — Mora:</strong> El retardo en el pago de cualquiera de las cuotas pactadas causará intereses de mora a la tasa máxima legal permitida, sin perjuicio de la facultad de EL CONCEDENTE de dar por terminado el contrato.</p>
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Parágrafo 2 — Cancelaciones y devoluciones:</strong> En caso de cancelación por parte de EL CONCESIONARIO, se aplicarán las siguientes penalizaciones sobre el valor total del contrato:
    <br>- Cancelación con 0 a 45 días antes del evento: retención del 45% del valor total.
    <br>- Cancelación entre 46 y 60 días antes del evento: retención del 35% del valor total.
    <br>- Cancelación con 61 a 90 días antes del evento: retención del 25% del valor total.
    <br>Si la cancelación es por causa imputable a EL CONCEDENTE, se devolverá la totalidad de los valores pagados.
  </p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">NOVENA. PROMOCIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO autoriza a EL CONCEDENTE para utilizar su nombre, razón social, marca y/o logotipo en la promoción y difusión de la Feria Effix {{anio}}, en los medios de comunicación y canales digitales que EL CONCEDENTE estime pertinentes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA. HORARIO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO deberá respetar los horarios de acceso al recinto, montaje, atención al público y desmontaje que EL CONCEDENTE establezca y comunique oportunamente. El incumplimiento de los horarios podrá generar costos adicionales a cargo de EL CONCESIONARIO.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA PRIMERA. AUTONOMÍA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato no genera ningún vínculo laboral entre las partes ni entre EL CONCEDENTE y el personal que EL CONCESIONARIO emplee para la atención del stand. EL CONCESIONARIO actúa de manera autónoma e independiente en el ejercicio de su actividad comercial.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SEGUNDA. RESPONSABILIDAD CIVIL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO será responsable de los daños que cause a terceros, al recinto o a EL CONCEDENTE, con ocasión del montaje, uso, operación o desmontaje de su stand. Se recomienda contar con un seguro de responsabilidad civil para cubrir estos riesgos.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA TERCERA. INGRESO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO recibirá las escarapelas y/o acreditaciones de acceso al evento según el paquete adquirido. El acceso estará sujeto al reglamento general del evento y de Plaza Mayor Medellín.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA CUARTA. CESIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO no podrá ceder, transferir ni subarrendar los derechos derivados del presente contrato a terceros, sin la autorización previa y escrita de EL CONCEDENTE.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA QUINTA. PROHIBICIONES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Queda expresamente prohibido a EL CONCESIONARIO: (i) distribuir escarapelas, volantes, material publicitario o muestras fuera del área del stand asignado, sin autorización de EL CONCEDENTE; (ii) realizar actividades de volanteo en los pasillos, áreas comunes o exteriores del recinto; (iii) instalar elementos que obstaculicen la circulación o afecten la visibilidad de otros expositores; (iv) utilizar equipos de sonido a volúmenes que perturben a los demás participantes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SEXTA. DERECHO DE RETRACTO — LEY 1480, ARTÍCULO 47</h3>
  <p style="text-align: justify; margin-bottom: 24px;">De conformidad con el artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor), cuando el presente contrato sea celebrado mediante métodos no tradicionales o a distancia, EL CONCESIONARIO podrá ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la celebración del contrato o a la entrega del bien, lo que ocurra después.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SÉPTIMA. TERMINACIÓN ANTICIPADA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE podrá dar por terminado el presente contrato de manera anticipada y unilateral, sin lugar a indemnización, en caso de incumplimiento grave de las obligaciones de EL CONCESIONARIO, previa comunicación escrita con un mínimo de cuarenta y ocho (48) horas de antelación.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA OCTAVA. DOMICILIO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Para todos los efectos legales y contractuales, las partes fijan como domicilio contractual la ciudad de Medellín, Colombia.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA. DOCUMENTOS INTEGRANTES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Forman parte integral del presente contrato: (i) <strong>Anexo 1:</strong> Reglamento interno de Plaza Mayor Medellín; (ii) <strong>Anexo 2:</strong> Manual del Expositor de la Feria Effix {{anio}}.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA PRIMERA. PROPIEDAD INTELECTUAL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Los derechos de propiedad intelectual sobre los contenidos, marcas, logos y materiales de comunicación de la Feria Effix son de titularidad exclusiva de EL CONCEDENTE, protegidos por la Ley 23 de 1982 y demás normas concordantes. EL CONCESIONARIO no podrá usarlos por fuera del marco del presente contrato sin autorización escrita previa.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA SEGUNDA. AUTORIZACIÓN GRABACIÓN Y FOTOGRAFÍA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO autoriza a EL CONCEDENTE para tomar fotografías y/o grabar video en el stand durante el evento, y utilizar dicho material en los canales de comunicación oficiales de la Feria Effix, de forma gratuita y sin limitación de tiempo o territorio.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA TERCERA. LIQUIDACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Las partes realizarán la liquidación del contrato dentro de los quince (15) días calendario siguientes a la fecha de terminación del mismo, oportunidad en la que se verificará el cumplimiento de las obligaciones mutuas y se procederá a los ajustes económicos a que haya lugar.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA CUARTA. RESOLUCIÓN DE CONFLICTOS</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Las controversias que surjan en relación con la interpretación, ejecución o terminación del presente contrato serán resueltas, en primer lugar, mediante arreglo directo entre las partes durante un período de sesenta (60) días calendario. Si no se logra acuerdo, las partes podrán acudir a los mecanismos legales ordinarios.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA QUINTA. ACUERDO INTEGRAL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato, junto con sus anexos, constituye el acuerdo integral entre las partes respecto a su objeto, y deja sin efecto cualquier negociación, representación o acuerdo previo, verbal o escrito, relacionado con el mismo.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA SEXTA. DERECHO DE RETENCIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">De conformidad con el artículo 2000 del Código Civil colombiano, EL CONCEDENTE podrá ejercer el derecho de retención sobre los bienes de EL CONCESIONARIO que se encuentren en el espacio asignado, en caso de que existan obligaciones dinerarias incumplidas a cargo de EL CONCESIONARIO al momento de la terminación del contrato.</p>

  <p style="text-align: justify; margin-top: 40px; margin-bottom: 40px;">En constancia de lo anterior, las partes suscriben el presente contrato de forma electrónica, de conformidad con la Ley 527 de 1999, en la fecha indicada en el sistema de firma electrónica.</p>

  <div style="margin-top: 64px; display: flex; justify-content: space-between; gap: 40px;">
    <div style="width: 45%;">
      <img src="/firma-omar-stevenson.png" alt="Firma Omar Stevenson Rivera" style="max-height: 80px; max-width: 200px; margin-bottom: 4px;" />
      <div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">
        <p style="margin: 0 0 4px 0; font-weight: bold;">EL CONCEDENTE</p>
        <p style="margin: 0 0 4px 0;">{{org_nombre}}</p>
        <p style="margin: 0 0 4px 0;">{{org_documento}}</p>
        <p style="margin: 0 0 4px 0;">{{org_empresa}}</p>
        <p style="margin: 0 0 4px 0;">NIT: {{org_nit}}</p>
        <p style="margin: 0 0 4px 0;">{{org_ciudad}}</p>
      </div>
    </div>
    <div style="width: 45%;">
      <div style="min-height: 72px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 4px;">
        [Firma electrónica]
      </div>
      <div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">
        <p style="margin: 0 0 4px 0; font-weight: bold;">EL CONCESIONARIO</p>
        {{#if empresa}}
        <p style="margin: 0 0 4px 0;">{{representante_legal}}</p>
        <p style="margin: 0 0 4px 0;">{{tipo_documento_representante}} No. {{numero_documento_representante}}</p>
        <p style="margin: 0 0 4px 0;">{{empresa}}</p>
        <p style="margin: 0 0 4px 0;">{{id_fiscal}}</p>
        {{else}}
        <p style="margin: 0 0 4px 0;">{{nombre_completo}}</p>
        <p style="margin: 0 0 4px 0;">{{tipo_documento}} No. {{numero_documento}}</p>
        {{#if pais}}<p style="margin: 0 0 4px 0;">Nacionalidad: {{pais}}</p>{{/if}}
        {{/if}}
      </div>
    </div>
  </div>

</div>',
  '[
    {"key": "tipo_persona", "label": "Tipo de persona", "type": "select", "required": true, "options": ["Persona Natural", "Persona Jurídica"]},
    {"key": "nombre_completo", "label": "Nombre completo (persona natural)", "type": "text", "required": false, "placeholder": "Juan García López"},
    {"key": "tipo_documento", "label": "Tipo de documento (persona natural)", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento", "label": "Número de documento (persona natural)", "type": "text", "required": false},
    {"key": "pais", "label": "País / Nacionalidad", "type": "text", "required": false, "placeholder": "México"},
    {"key": "empresa", "label": "Razón social (persona jurídica)", "type": "text", "required": false, "placeholder": "Empresa SAS"},
    {"key": "id_fiscal", "label": "ID fiscal / NIT (persona jurídica)", "type": "text", "required": false, "placeholder": "NIT 900.123.456-7"},
    {"key": "sigla", "label": "Sigla (opcional)", "type": "text", "required": false, "placeholder": "EMP"},
    {"key": "representante_legal", "label": "Nombre del representante legal", "type": "text", "required": false},
    {"key": "tipo_documento_representante", "label": "Tipo documento del representante", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento_representante", "label": "Número documento del representante", "type": "text", "required": false},
    {"key": "direccion", "label": "Dirección", "type": "text", "required": true, "placeholder": "Calle 10 # 20-30"},
    {"key": "ciudad", "label": "Ciudad", "type": "text", "required": true, "placeholder": "Medellín"},
    {"key": "departamento", "label": "Departamento", "type": "text", "required": true, "placeholder": "Antioquia"},
    {"key": "telefono", "label": "Teléfono fijo", "type": "text", "required": false, "placeholder": "604 0000000"},
    {"key": "celular", "label": "Celular", "type": "text", "required": true, "placeholder": "+57 300 0000000"},
    {"key": "email", "label": "Correo electrónico", "type": "text", "required": true, "placeholder": "contacto@empresa.com"},
    {"key": "web_redes", "label": "Web / Redes sociales (opcional)", "type": "text", "required": false, "placeholder": "www.empresa.com / @empresa"},
    {"key": "persona_encargada", "label": "Persona encargada del stand (opcional)", "type": "text", "required": false},
    {"key": "email_encargada", "label": "Correo de la persona encargada", "type": "text", "required": false},
    {"key": "celular_encargada", "label": "Celular de la persona encargada", "type": "text", "required": false},
    {"key": "pabellon", "label": "Pabellón", "type": "text", "required": true, "placeholder": "Pabellón A"},
    {"key": "numero_stand", "label": "Número de stand", "type": "text", "required": true, "placeholder": "A-15"},
    {"key": "tamano_stand", "label": "Tamaño del stand", "type": "text", "required": true, "placeholder": "9 m²"},
    {"key": "valor_total", "label": "Valor total (IVA incluido)", "type": "text", "required": true, "placeholder": "5.000.000"},
    {"key": "valor_abono", "label": "Valor del abono", "type": "text", "required": true, "placeholder": "2.500.000"},
    {"key": "moneda", "label": "Moneda", "type": "select", "required": true, "options": ["COP", "USD", "EUR"]},
    {"key": "anio", "label": "Año del evento", "type": "text", "required": true, "placeholder": "2026"}
  ]'::jsonb
);

-- ================================================
-- Template 3: Contrato de Patrocinios
-- ================================================
INSERT INTO contract_templates (name, slug, description, content, variables) VALUES (
  'Contrato de Patrocinio',
  'patrocinio-effix',
  'Contrato de concesión de espacios y alianza estratégica para patrocinadores de la Feria Effix',
  '<div style="font-family: Georgia, serif; max-width: 820px; margin: 0 auto; padding: 48px 56px; line-height: 1.9; color: #1a1a1a; font-size: 14px;">

  <div style="text-align: center; margin-bottom: 48px; border-bottom: 2px solid #1a1a1a; padding-bottom: 32px;">
    <h1 style="font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 0 0 8px 0; text-transform: uppercase;">CONTRATO DE PATROCINIO Y ALIANZA ESTRATÉGICA</h1>
    <h2 style="font-size: 16px; font-weight: normal; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">FERIA EFFIX {{anio}}</h2>
  </div>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 16px;">INFORMACIÓN GENERAL DEL CONCESIONARIO / PATROCINADOR</h3>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 35%;">Nombre / Razón social</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">
        {{#if empresa}}{{empresa}}{{else}}{{nombre_completo}}{{/if}}
      </td>
    </tr>
    {{#if sigla}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Sigla</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{sigla}}</td>
    </tr>
    {{/if}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">
        {{#if empresa}}NIT / ID Fiscal{{else}}Tipo y N.º Documento{{/if}}
      </td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">
        {{#if empresa}}{{id_fiscal}}{{else}}{{tipo_documento}} No. {{numero_documento}}{{/if}}
      </td>
    </tr>
    {{#if empresa}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Representante legal</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{representante_legal}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Documento representante</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{tipo_documento_representante}} No. {{numero_documento_representante}}</td>
    </tr>
    {{/if}}
    {{#if pais}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">País</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{pais}}</td>
    </tr>
    {{/if}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Tipo de patrocinio</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;"><strong>{{tipo_patrocinio}}</strong></td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Dirección</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{direccion}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Ciudad / Departamento</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{ciudad}} / {{departamento}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Teléfono / Celular</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{telefono}} / {{celular}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Correo electrónico</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{email}}</td>
    </tr>
    {{#if web_redes}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Web / Redes sociales</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{web_redes}}</td>
    </tr>
    {{/if}}
    {{#if persona_encargada}}
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Persona encargada</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{persona_encargada}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Correo encargado(a)</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{email_encargada}}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px 12px; background: #f5f5f5; font-weight: bold;">Celular encargado(a)</td>
      <td style="border: 1px solid #ccc; padding: 8px 12px;">{{celular_encargada}}</td>
    </tr>
    {{/if}}
  </table>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 16px;">VALOR DEL PATROCINIO</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
    <thead>
      <tr style="background: #e5e7eb; color: #111;">
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Tipo de patrocinio</th>
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Valor total (IVA incluido)</th>
        <th style="border: 1px solid #ccc; padding: 8px 12px; text-align: left;">Valor abono</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px 12px;">{{tipo_patrocinio}}</td>
        <td style="border: 1px solid #ccc; padding: 8px 12px;"><strong>{{valor_total}} {{moneda}}</strong></td>
        <td style="border: 1px solid #ccc; padding: 8px 12px;"><strong>{{valor_abono}} {{moneda}}</strong></td>
      </tr>
    </tbody>
  </table>

  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato de concesión mercantil de espacio físico y alianza estratégica —el cual no constituye arrendamiento— se celebra entre <strong>EFFIX S.A.S.</strong>, identificada con NIT {{org_nit}}, representada por <strong>{{org_nombre}}</strong>, identificado(a) con {{org_documento}}, en adelante <strong>EL CONCEDENTE</strong>; y el titular identificado en la sección de Información General, en adelante <strong>EL CONCESIONARIO</strong>.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">CONSIDERACIONES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE ha suscrito contrato con Plaza Mayor Medellín Convenciones y Exposiciones S.A. para el uso de sus instalaciones durante el período del evento. EL CONCESIONARIO conoce y acepta que las condiciones de uso del espacio físico están sujetas al reglamento interno de Plaza Mayor, cuyo Anexo 1 hace parte integral del presente contrato.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">PRIMERA. OBJETO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE otorga a EL CONCESIONARIO el uso temporal del espacio físico y/o alianza estratégica correspondiente al paquete de patrocinio <strong>{{tipo_patrocinio}}</strong> en las instalaciones de Plaza Mayor Medellín, para los fines exclusivos de visibilidad de marca, exhibición y/o comercialización de los productos y/o servicios del CONCESIONARIO durante la Feria Effix {{anio}}.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SEGUNDA. OBLIGACIONES DEL CONCESIONARIO</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONCESIONARIO se obliga a:</p>
  <ol style="text-align: justify; padding-left: 24px; margin-bottom: 12px;">
    <li style="margin-bottom: 8px;">Usar el espacio y/o los beneficios concedidos exclusivamente para los fines del objeto contractual.</li>
    <li style="margin-bottom: 8px;">Cumplir con el reglamento interno de Plaza Mayor Medellín (Anexo 1) y el Manual del Expositor (Anexo 2), los cuales forman parte integral del presente contrato.</li>
    <li style="margin-bottom: 8px;">Entregar a EL CONCEDENTE los materiales de marca (logotipos, piezas gráficas, contenidos) con la anticipación que se indique, para su correcta integración en los soportes de comunicación del evento.</li>
    <li style="margin-bottom: 8px;">Contar con todos los permisos, licencias y autorizaciones legales requeridas para la exhibición y/o venta de sus productos o servicios.</li>
    <li style="margin-bottom: 8px;">No ceder, subarrendar ni transferir a ningún título los derechos derivados del presente contrato, sin autorización previa y escrita de EL CONCEDENTE.</li>
    <li style="margin-bottom: 8px;">Responder por los daños que cause al espacio físico, a las instalaciones del recinto o a terceros.</li>
    <li style="margin-bottom: 8px;">Cumplir con los horarios establecidos por EL CONCEDENTE.</li>
    <li style="margin-bottom: 8px;">Disponer adecuadamente los residuos generados, conforme a las normas ambientales y del recinto.</li>
    <li style="margin-bottom: 8px;">No instalar estructuras o elementos que superen los límites del espacio asignado o que obstaculicen la circulación.</li>
  </ol>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">TERCERA. RESPONSABILIDAD POR BIENES DE TERCEROS</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE no asume responsabilidad alguna por pérdida, hurto, deterioro o daño de los bienes, equipos, mercancías o elementos de EL CONCESIONARIO o de terceros que se encuentren en el espacio asignado. EL CONCESIONARIO deberá adoptar las medidas de seguridad que estime necesarias para la protección de sus bienes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">CUARTA. OBLIGACIONES DEL CONCEDENTE</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONCEDENTE se obliga a:</p>
  <ol style="text-align: justify; padding-left: 24px; margin-bottom: 12px;">
    <li style="margin-bottom: 8px;">Garantizar la visibilidad de marca del CONCESIONARIO conforme al paquete de patrocinio contratado.</li>
    <li style="margin-bottom: 8px;">Entregar el espacio físico asignado, si aplica, en las condiciones acordadas y en los plazos establecidos.</li>
    <li style="margin-bottom: 8px;">Realizar la promoción y difusión general de la Feria Effix {{anio}} e incluir la marca del CONCESIONARIO según el nivel de patrocinio.</li>
    <li style="margin-bottom: 8px;">Brindar a EL CONCESIONARIO la información necesaria para el correcto cumplimiento de sus obligaciones.</li>
  </ol>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">QUINTA. INDEMNIDAD</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO mantendrá indemne a EL CONCEDENTE frente a cualquier reclamación, demanda, sanción o daño que se derive del incumplimiento de sus obligaciones legales, del daño a terceros o del uso inadecuado del espacio concedido o de los beneficios de la alianza estratégica.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SEXTA. FUERZA MAYOR</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Ninguna de las partes será responsable por el incumplimiento de sus obligaciones cuando dicho incumplimiento sea consecuencia de un evento de fuerza mayor o caso fortuito debidamente acreditado. La parte afectada deberá notificar a la otra de inmediato y por escrito.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">SÉPTIMA. DURACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato tendrá vigencia desde la fecha de su suscripción y hasta la culminación de la Feria Effix {{anio}}, incluyendo el desmontaje de los elementos del patrocinio, si aplica.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">OCTAVA. REMUNERACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 12px;">EL CONCESIONARIO pagará a EL CONCEDENTE la suma de <strong>{{valor_total}} {{moneda}}</strong> ({{valor_patrocinio_letras}}) como contraprestación por el patrocinio, alianza estratégica y/o espacio físico descritos en el presente contrato.</p>
  {{#if forma_pago}}
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Forma de pago:</strong> {{forma_pago}}</p>
  {{/if}}
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Parágrafo 1 — Mora:</strong> El retardo en el pago de cualquiera de las cuotas pactadas causará intereses de mora a la tasa máxima legal permitida, sin perjuicio de la facultad de EL CONCEDENTE de dar por terminado el contrato.</p>
  <p style="text-align: justify; margin-bottom: 12px;"><strong>Parágrafo 2 — Cancelaciones y devoluciones:</strong> En caso de cancelación del stand, patrocinio y/o alianza estratégica por parte de EL CONCESIONARIO, se aplicarán las siguientes penalizaciones sobre el valor total del contrato:
    <br>- Cancelación con 0 a 45 días antes del evento: retención del 45% del valor total.
    <br>- Cancelación entre 46 y 60 días antes del evento: retención del 35% del valor total.
    <br>- Cancelación con 61 a 90 días antes del evento: retención del 25% del valor total.
    <br>Si la cancelación es por causa de fuerza mayor imputable a EL CONCEDENTE, este devolverá la totalidad del dinero recibido de EL CONCESIONARIO.
    <br>En caso de incumplimiento de las obligaciones por parte de EL CONCESIONARIO, se aplicará una penalización del 20% sobre el valor total del contrato, sin perjuicio de las demás acciones legales.
  </p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">NOVENA. PROMOCIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO autoriza a EL CONCEDENTE para utilizar su nombre, razón social, marca y/o logotipo en la promoción y difusión de la Feria Effix {{anio}}, en los medios de comunicación y canales digitales que EL CONCEDENTE estime pertinentes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA. HORARIO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO deberá respetar los horarios de acceso al recinto, montaje, atención al público y desmontaje que EL CONCEDENTE establezca y comunique oportunamente.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA PRIMERA. AUTONOMÍA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato no genera ningún vínculo laboral entre las partes ni entre EL CONCEDENTE y el personal que EL CONCESIONARIO emplee. EL CONCESIONARIO actúa de manera autónoma e independiente en el ejercicio de su actividad comercial.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SEGUNDA. RESPONSABILIDAD CIVIL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO será responsable de los daños que cause a terceros, al recinto o a EL CONCEDENTE, con ocasión del montaje, uso, operación o desmontaje de los elementos del patrocinio.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA TERCERA. INGRESO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO recibirá las escarapelas y/o acreditaciones de acceso al evento según el paquete de patrocinio adquirido. El acceso estará sujeto al reglamento general del evento y de Plaza Mayor Medellín.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA CUARTA. CESIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO no podrá ceder, transferir ni subarrendar los derechos derivados del presente contrato a terceros, sin la autorización previa y escrita de EL CONCEDENTE.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA QUINTA. PROHIBICIONES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Queda expresamente prohibido a EL CONCESIONARIO: (i) distribuir escarapelas, volantes, material publicitario o muestras fuera del área asignada, sin autorización de EL CONCEDENTE; (ii) realizar actividades de volanteo en los pasillos, áreas comunes o exteriores del recinto; (iii) instalar elementos que obstaculicen la circulación o afecten la visibilidad de otros expositores; (iv) utilizar equipos de sonido a volúmenes que perturben a los demás participantes.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SEXTA. DERECHO DE RETRACTO — LEY 1480, ARTÍCULO 47</h3>
  <p style="text-align: justify; margin-bottom: 24px;">De conformidad con el artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor), cuando el presente contrato sea celebrado mediante métodos no tradicionales o a distancia, EL CONCESIONARIO podrá ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la celebración del contrato o a la entrega del bien, lo que ocurra después.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA SÉPTIMA. TERMINACIÓN ANTICIPADA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCEDENTE podrá dar por terminado el presente contrato de manera anticipada y unilateral, sin lugar a indemnización, en caso de incumplimiento grave de las obligaciones de EL CONCESIONARIO, previa comunicación escrita con un mínimo de cuarenta y ocho (48) horas de antelación.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">DÉCIMA OCTAVA. DOMICILIO</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Para todos los efectos legales y contractuales, las partes fijan como domicilio contractual la ciudad de Medellín, Colombia.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA. DOCUMENTOS INTEGRANTES</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Forman parte integral del presente contrato: (i) <strong>Anexo 1:</strong> Reglamento interno de Plaza Mayor Medellín; (ii) <strong>Anexo 2:</strong> Manual del Expositor de la Feria Effix {{anio}}.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA PRIMERA. PROPIEDAD INTELECTUAL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Los derechos de propiedad intelectual sobre los contenidos, marcas, logos y materiales de comunicación de la Feria Effix son de titularidad exclusiva de EL CONCEDENTE, protegidos por la Ley 23 de 1982 y demás normas concordantes. EL CONCESIONARIO no podrá usarlos por fuera del marco del presente contrato sin autorización escrita previa.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA SEGUNDA. AUTORIZACIÓN GRABACIÓN Y FOTOGRAFÍA</h3>
  <p style="text-align: justify; margin-bottom: 24px;">EL CONCESIONARIO autoriza a EL CONCEDENTE para tomar fotografías y/o grabar video de las activaciones de patrocinio durante el evento, y utilizar dicho material en los canales de comunicación oficiales de la Feria Effix, de forma gratuita y sin limitación de tiempo o territorio.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA TERCERA. LIQUIDACIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Las partes realizarán la liquidación del contrato dentro de los quince (15) días calendario siguientes a la fecha de terminación del mismo, oportunidad en la que se verificará el cumplimiento de las obligaciones mutuas y se procederá a los ajustes económicos a que haya lugar.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA CUARTA. RESOLUCIÓN DE CONFLICTOS</h3>
  <p style="text-align: justify; margin-bottom: 24px;">Las controversias que surjan en relación con la interpretación, ejecución o terminación del presente contrato serán resueltas, en primer lugar, mediante arreglo directo entre las partes durante un período de sesenta (60) días calendario. Si no se logra acuerdo, las partes podrán acudir a los mecanismos legales ordinarios.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA QUINTA. ACUERDO INTEGRAL</h3>
  <p style="text-align: justify; margin-bottom: 24px;">El presente contrato, junto con sus anexos, constituye el acuerdo integral entre las partes respecto a su objeto, y deja sin efecto cualquier negociación, representación o acuerdo previo, verbal o escrito, relacionado con el mismo.</p>

  <h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 8px;">VIGÉSIMA SEXTA. DERECHO DE RETENCIÓN</h3>
  <p style="text-align: justify; margin-bottom: 24px;">De conformidad con el artículo 2000 del Código Civil colombiano, EL CONCEDENTE podrá ejercer el derecho de retención sobre los bienes de EL CONCESIONARIO que se encuentren en el espacio asignado, en caso de que existan obligaciones dinerarias incumplidas a cargo de EL CONCESIONARIO al momento de la terminación del contrato.</p>

  <p style="text-align: justify; margin-top: 40px; margin-bottom: 40px;">En constancia de lo anterior, las partes suscriben el presente contrato de forma electrónica, de conformidad con la Ley 527 de 1999, en la fecha indicada en el sistema de firma electrónica.</p>

  <div style="margin-top: 64px; display: flex; justify-content: space-between; gap: 40px;">
    <div style="width: 45%;">
      <img src="/firma-omar-stevenson.png" alt="Firma Omar Stevenson Rivera" style="max-height: 80px; max-width: 200px; margin-bottom: 4px;" />
      <div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">
        <p style="margin: 0 0 4px 0; font-weight: bold;">EL CONCEDENTE</p>
        <p style="margin: 0 0 4px 0;">{{org_nombre}}</p>
        <p style="margin: 0 0 4px 0;">{{org_documento}}</p>
        <p style="margin: 0 0 4px 0;">{{org_empresa}}</p>
        <p style="margin: 0 0 4px 0;">NIT: {{org_nit}}</p>
        <p style="margin: 0 0 4px 0;">{{org_ciudad}}</p>
      </div>
    </div>
    <div style="width: 45%;">
      <div style="min-height: 72px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 4px;">
        [Firma electrónica]
      </div>
      <div style="border-top: 1px solid #1a1a1a; padding-top: 12px;">
        <p style="margin: 0 0 4px 0; font-weight: bold;">EL CONCESIONARIO / PATROCINADOR</p>
        {{#if empresa}}
        <p style="margin: 0 0 4px 0;">{{representante_legal}}</p>
        <p style="margin: 0 0 4px 0;">{{tipo_documento_representante}} No. {{numero_documento_representante}}</p>
        <p style="margin: 0 0 4px 0;">{{empresa}}</p>
        <p style="margin: 0 0 4px 0;">{{id_fiscal}}</p>
        {{else}}
        <p style="margin: 0 0 4px 0;">{{nombre_completo}}</p>
        <p style="margin: 0 0 4px 0;">{{tipo_documento}} No. {{numero_documento}}</p>
        {{#if pais}}<p style="margin: 0 0 4px 0;">Nacionalidad: {{pais}}</p>{{/if}}
        {{/if}}
      </div>
    </div>
  </div>

</div>',
  '[
    {"key": "tipo_persona", "label": "Tipo de persona", "type": "select", "required": true, "options": ["Persona Natural", "Persona Jurídica"]},
    {"key": "nombre_completo", "label": "Nombre completo (persona natural)", "type": "text", "required": false, "placeholder": "Juan García López"},
    {"key": "tipo_documento", "label": "Tipo de documento (persona natural)", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento", "label": "Número de documento (persona natural)", "type": "text", "required": false},
    {"key": "pais", "label": "País / Nacionalidad", "type": "text", "required": false, "placeholder": "México"},
    {"key": "empresa", "label": "Razón social (persona jurídica)", "type": "text", "required": false, "placeholder": "Empresa SAS"},
    {"key": "id_fiscal", "label": "ID fiscal / NIT (persona jurídica)", "type": "text", "required": false, "placeholder": "NIT 900.123.456-7"},
    {"key": "sigla", "label": "Sigla (opcional)", "type": "text", "required": false, "placeholder": "EMP"},
    {"key": "representante_legal", "label": "Nombre del representante legal", "type": "text", "required": false},
    {"key": "tipo_documento_representante", "label": "Tipo documento del representante", "type": "select", "required": false, "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"]},
    {"key": "numero_documento_representante", "label": "Número documento del representante", "type": "text", "required": false},
    {"key": "direccion", "label": "Dirección", "type": "text", "required": true, "placeholder": "Calle 10 # 20-30"},
    {"key": "ciudad", "label": "Ciudad", "type": "text", "required": true, "placeholder": "Medellín"},
    {"key": "departamento", "label": "Departamento", "type": "text", "required": true, "placeholder": "Antioquia"},
    {"key": "telefono", "label": "Teléfono fijo", "type": "text", "required": false, "placeholder": "604 0000000"},
    {"key": "celular", "label": "Celular", "type": "text", "required": true, "placeholder": "+57 300 0000000"},
    {"key": "email", "label": "Correo electrónico", "type": "text", "required": true, "placeholder": "contacto@empresa.com"},
    {"key": "web_redes", "label": "Web / Redes sociales (opcional)", "type": "text", "required": false, "placeholder": "www.empresa.com / @empresa"},
    {"key": "persona_encargada", "label": "Persona encargada (opcional)", "type": "text", "required": false},
    {"key": "email_encargada", "label": "Correo de la persona encargada", "type": "text", "required": false},
    {"key": "celular_encargada", "label": "Celular de la persona encargada", "type": "text", "required": false},
    {"key": "tipo_patrocinio", "label": "Tipo de patrocinio", "type": "select", "required": true, "options": ["Patrocinio Black", "Patrocinio Diamante", "Patrocinio Platino", "Patrocinio Oro", "Patrocinio Plata", "Patrocinio Bronce"]},
    {"key": "valor_total", "label": "Valor total (IVA incluido)", "type": "text", "required": true, "placeholder": "20.000.000"},
    {"key": "valor_abono", "label": "Valor del abono", "type": "text", "required": true, "placeholder": "10.000.000"},
    {"key": "moneda", "label": "Moneda", "type": "select", "required": true, "options": ["COP", "USD", "EUR"]},
    {"key": "anio", "label": "Año del evento", "type": "text", "required": true, "placeholder": "2026"}
  ]'::jsonb
);
