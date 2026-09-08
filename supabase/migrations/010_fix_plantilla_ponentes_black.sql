-- La plantilla importada "1. Modelo de contrato ponentes con Pago ponencia +
-- viaticos + Black y VIP" traía la empresa emisora, el representante legal y
-- el año del evento escritos a mano, y en la tabla de datos solo imprimía el
-- NIT (id_fiscal) y el nombre de persona natural, así que para cédulas y para
-- personas jurídicas quedaban celdas vacías. Se pasan a variables y se añaden
-- al arreglo `variables` las claves que el formulario necesita conocer.
--
-- Ejecutar en: https://supabase.com/dashboard/project/hidkhplgahoiusfxfrzi/sql/new
-- (Aplicada el 2026-09-07 en dos pasos vía MCP: fix_plantilla_ponentes_black y
-- fix_plantilla_ponentes_black_tabla.)

-- 1. Empresa emisora, representante y año como variables; encabezado con la
--    razón social del contratista cuando es persona jurídica.
update contratos.contract_templates
   set content = replace(replace(replace(replace(replace(
         regexp_replace(
           content,
           'ENTRE\s+\{\{nombre_completo\}\} Y EFFIX S\.A\.S\.',
           'ENTRE {{#if empresa}}{{empresa}}{{else}}{{nombre_completo}}{{/if}} Y {{org_empresa}}'
         ),
         'EFFIX S.A.S.', '{{org_empresa}}'),
         'NIT. 901.497.359 - 1', 'NIT {{org_nit}}'),
         'OMAR STEVENSON RIVERA CORREA', '{{org_nombre}}'),
         '2026', '{{anio}}'),
         'Teléfono persona encargada', 'Teléfono / correo persona encargada'),
       variables = variables || '[
         {"key": "tipo_persona", "type": "select", "label": "Tipo de persona", "options": ["Persona Natural", "Persona Jurídica"], "required": true},
         {"key": "tipo_documento", "type": "select", "label": "Tipo de documento (persona natural)", "options": ["C.C.", "C.E.", "Pasaporte", "DNI", "Tax ID"], "required": false},
         {"key": "numero_documento", "type": "text", "label": "Número de documento (persona natural)", "required": false},
         {"key": "empresa", "type": "text", "label": "Razón social (persona jurídica)", "required": false, "placeholder": "Empresa SAS"},
         {"key": "representante_legal", "type": "text", "label": "Nombre del representante legal", "required": false},
         {"key": "email_encargada", "type": "email", "label": "Correo de la persona encargada", "required": false},
         {"key": "anio", "type": "text", "label": "Año del evento", "required": true, "placeholder": "2026"}
       ]'::jsonb,
       updated_at = now()
 where slug = '1-modelo-de-contrato-ponentes-con-pago-ponencia-viaticos-bla'
   and content like '%EFFIX S.A.S.%';

-- 2. Celdas de la tabla "Información general". Los <p> llevan atributos de
--    estilo, por eso se usa regexp_replace y no replace().
update contratos.contract_templates
   set content = regexp_replace(regexp_replace(regexp_replace(
         content,
         '(<p[^>]*>)\{\{id_fiscal\}\}(</p>)',
         '\1{{#if id_fiscal}}{{id_fiscal}}{{else}}{{tipo_documento}} {{numero_documento}}{{/if}}\2', 'g'),
         '(<p[^>]*>)\{\{nombre_completo\}\}(</p>)',
         '\1{{#if empresa}}{{empresa}}{{else}}{{nombre_completo}}{{/if}}\2', 'g'),
         '(<p[^>]*>)\{\{celular_encargada\}\}(</p>)',
         '\1{{celular_encargada}}{{#if email_encargada}} · {{email_encargada}}{{/if}}\2', 'g'),
       updated_at = now()
 where slug = '1-modelo-de-contrato-ponentes-con-pago-ponencia-viaticos-bla';
