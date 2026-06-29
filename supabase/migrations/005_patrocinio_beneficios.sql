-- Migración: reemplazar tabla 3 columnas por caja de beneficios en template patrocinio-effix
-- Ejecutar en: https://supabase.com/dashboard/project/qatfslzsbjokqodvjvhu/sql/new

-- 1. Actualizar el contenido HTML del template
UPDATE contract_templates
SET content = regexp_replace(
  content,
  '<h3[^>]*>VALOR DEL PATROCINIO</h3>\s*<table[^>]*>.*?</table>',
  '<h3 style="font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 32px; margin-bottom: 16px;">BENEFICIOS DEL PATROCINIO</h3>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px;">
    <thead>
      <tr>
        <th style="border: 1px solid #ccc; padding: 10px 12px; text-align: center; background: #e5e7eb; color: #111;">
          <div style="font-weight: bold;">Beneficios {{tipo_patrocinio}}</div>
          <div style="margin-top: 4px;">{{valor_patrocinio}}</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #ccc; padding: 12px; vertical-align: top; line-height: 1.7; white-space: pre-wrap;">{{beneficios_patrocinio}}</td>
      </tr>
    </tbody>
  </table>',
  'ns'
)
WHERE slug = 'patrocinio-effix';

-- 2. Reemplazar valor_abono por beneficios_patrocinio en el mismo orden
UPDATE contract_templates
SET variables = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'key' = 'valor_abono'
      THEN jsonb_build_object(
        'key', 'beneficios_patrocinio',
        'label', 'Beneficios del patrocinio',
        'type', 'textarea',
        'required', true,
        'placeholder', '· Beneficio 1' || chr(10) || '· Beneficio 2'
      )
      ELSE elem
    END
    ORDER BY ordinality
  )
  FROM jsonb_array_elements(variables) WITH ORDINALITY AS t(elem, ordinality)
)
WHERE slug = 'patrocinio-effix';

-- Verificar que el cambio quedó bien
SELECT
  slug,
  (SELECT jsonb_agg(elem->>'key') FROM jsonb_array_elements(variables) AS elem) AS campos,
  (content LIKE '%BENEFICIOS DEL PATROCINIO%') AS tiene_nueva_seccion,
  (content LIKE '%VALOR DEL PATROCINIO%') AS tiene_seccion_vieja
FROM contract_templates
WHERE slug = 'patrocinio-effix';
