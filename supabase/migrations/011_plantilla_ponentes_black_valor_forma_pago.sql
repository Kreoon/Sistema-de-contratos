-- En la plantilla "1. Modelo de contrato ponentes con Pago ponencia + viaticos
-- + Black y VIP" la cláusula TERCERA (Remuneración y forma de pago) conservaba
-- el texto del Word "(valor a pagar en letras y números) PESOS COLOMBIANOS)"
-- sin conectar al formulario, y no imprimía la forma de pago. Se enlaza con
-- la sección "Valor y Forma de Pago" de Nuevo Contrato: {{honorarios}} lleva
-- el monto ya formateado con su moneda, {{honorarios_letras}} el valor en
-- letras y {{forma_pago}} el cronograma de cuotas (solo si se definió).
--
-- Ejecutar en: https://supabase.com/dashboard/project/hidkhplgahoiusfxfrzi/sql/new
-- (Aplicada el 2026-09-07 vía MCP: plantilla_ponentes_black_valor_forma_pago.)

update contratos.contract_templates
   set content = regexp_replace(
         regexp_replace(
           content,
           'la suma\s*<strong>\s*de\s*\(valor a pagar[^)]*\)\s*PESOS COLOMBIANOS\)?\s*</strong>',
           'la suma de <strong>{{honorarios}}</strong> ({{honorarios_letras}})'
         ),
         -- Reutiliza el mismo <p ...> de la cláusula para el párrafo de forma de pago
         '(<p[^>]*>)(<strong>TERCERA\. Remuneración.*?<strong>LA PONENCIA\. </strong></p>)',
         '\1\2{{#if forma_pago}}\1<strong>Forma de pago:</strong> {{forma_pago}}</p>{{/if}}'
       ),
       variables = variables || '[
         {"key": "honorarios", "type": "number", "label": "Honorarios (valor total)", "required": true, "placeholder": "5000000"},
         {"key": "moneda", "type": "select", "label": "Moneda", "options": ["COP", "USD", "EUR"], "required": true},
         {"key": "forma_pago", "type": "textarea", "label": "Forma de pago", "required": false}
       ]'::jsonb,
       updated_at = now()
 where slug = '1-modelo-de-contrato-ponentes-con-pago-ponencia-viaticos-bla'
   and content like '%valor a pagar en letras%';
