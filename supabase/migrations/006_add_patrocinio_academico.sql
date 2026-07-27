-- Migración: agregar "Patrocinio Académico" a las opciones de tipo_patrocinio
-- Ejecutar en: https://supabase.com/dashboard/project/qatfslzsbjokqodvjvhu/sql/new

UPDATE contract_templates
SET variables = (
  SELECT jsonb_agg(
    CASE
      WHEN elem->>'key' = 'tipo_patrocinio'
      THEN jsonb_set(
        elem,
        '{options}',
        (elem->'options') || '["Patrocinio Académico"]'::jsonb
      )
      ELSE elem
    END
    ORDER BY ordinality
  )
  FROM jsonb_array_elements(variables) WITH ORDINALITY AS t(elem, ordinality)
)
WHERE slug = 'patrocinio-effix'
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(variables) AS elem,
         jsonb_array_elements_text(elem->'options') AS opt
    WHERE elem->>'key' = 'tipo_patrocinio'
      AND opt = 'Patrocinio Académico'
  );

-- Verificar que el cambio quedó bien
SELECT
  slug,
  (SELECT elem->'options' FROM jsonb_array_elements(variables) AS elem WHERE elem->>'key' = 'tipo_patrocinio') AS opciones_tipo_patrocinio
FROM contract_templates
WHERE slug = 'patrocinio-effix';
