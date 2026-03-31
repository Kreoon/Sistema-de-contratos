import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Contract, ContractStatus } from '@/lib/types'

interface Filters {
  status?: ContractStatus
  search?: string
}

export function useContracts(filters?: Filters) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContracts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('contracts')
      .select('*, template:contract_templates(name, slug)')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.search) {
      query = query.or(
        `signer_name.ilike.%${filters.search}%,signer_email.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query
    if (!error && data) setContracts(data as Contract[])
    setLoading(false)
  }, [filters?.status, filters?.search])

  useEffect(() => { fetchContracts() }, [fetchContracts])

  return { contracts, loading, refetch: fetchContracts }
}
