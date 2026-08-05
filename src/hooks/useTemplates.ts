import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ContractTemplate } from "@/lib/types";

interface UseTemplatesOptions {
  /** Incluir plantillas desactivadas (para la pantalla de administración) */
  includeInactive?: boolean;
}

export function useTemplates(options: UseTemplatesOptions = {}) {
  const includeInactive = options.includeInactive ?? false;
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("contract_templates").select("*");
    if (!includeInactive) query = query.eq("is_active", true);
    const { data, error } = await query.order("name");
    if (!error && data) setTemplates(data);
    setLoading(false);
  }, [includeInactive]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, refetch: fetchTemplates };
}
