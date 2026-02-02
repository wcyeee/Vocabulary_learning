import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCards(notebookId) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (notebookId) {
      fetchCards()
    }
  }, [notebookId])

  const fetchCards = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createCard = async (cardData) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{
          notebook_id: notebookId,
          ...cardData,
          status: 'new',
          consecutive_familiar_count: 0
        }])
        .select()
        .single()

      if (error) throw error
      await fetchCards()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const createCardsBatch = async (cardsData) => {
    try {
      const cardsToInsert = cardsData.map(card => ({
        notebook_id: notebookId,
        ...card,
        status: 'new',
        consecutive_familiar_count: 0
      }))

      const { data, error } = await supabase
        .from('cards')
        .insert(cardsToInsert)
        .select()

      if (error) throw error
      await fetchCards()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateCard = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchCards()
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const deleteCard = async (id) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCards()
      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  return {
    cards,
    loading,
    error,
    fetchCards,
    createCard,
    createCardsBatch,
    updateCard,
    deleteCard,
  }
}
