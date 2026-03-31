import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Contact, ContactCategory } from '@/lib/types'

interface Filters {
  categoria?: ContactCategory
  pais?: string
  search?: string
}

export function useContacts(filters?: Filters) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('contacts_with_stats')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters?.categoria) query = query.eq('categoria', filters.categoria)
    if (filters?.pais) query = query.eq('pais', filters.pais)
    if (filters?.search) {
      query = query.or(
        `nombre_completo.ilike.%${filters.search}%,empresa.ilike.%${filters.search}%,email.ilike.%${filters.search}%,representante_legal.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query
    if (!error && data) setContacts(data as Contact[])
    setLoading(false)
  }, [filters?.categoria, filters?.pais, filters?.search])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  return { contacts, loading, refetch: fetchContacts }
}
