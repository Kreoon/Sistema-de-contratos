import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContractTemplate } from '@/lib/types'

export function useTemplates() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (!error && data) setTemplates(data)
    setLoading(false)
  }

  useEffect(() => { fetchTemplates() }, [])

  return { templates, loading, refetch: fetchTemplates }
}
