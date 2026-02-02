import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotebooks()
  }, [])

  const fetchNotebooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notebooks')
        .select(`
          *,
          cards (
            id,
            status
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add stats to each notebook
      const notebooksWithStats = data.map(notebook => ({
        ...notebook,
        total_cards: notebook.cards?.length || 0,
        normal_cards: notebook.cards?.filter(c => c.status === 'normal').length || 0,
        familiar_cards: notebook.cards?.filter(c => c.status === 'familiar').length || 0,
      }))

      setNotebooks(notebooksWithStats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createNotebook = async (name) => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert([{ name }])
        .select()
        .single()

      if (error) throw error
      await fetchNotebooks()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateNotebook = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('notebooks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchNotebooks()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deleteNotebook = async (id) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchNotebooks()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const togglePin = async (id, currentPinned) => {
    return updateNotebook(id, { is_pinned: !currentPinned })
  }

  return {
    notebooks,
    loading,
    error,
    fetchNotebooks,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    togglePin,
  }
}
