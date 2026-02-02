import { useState, useEffect } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export default function AllCards() {
  const [cards, setCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('alpha') // 'alpha' or 'date'

  useEffect(() => {
    fetchAllCards()
  }, [])

  useEffect(() => {
    filterAndSortCards()
  }, [cards, searchQuery, sortBy])

  const fetchAllCards = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          notebook:notebooks(name)
        `)
        .order('english', { ascending: true })

      if (error) throw error
      setCards(data || [])
    } catch (err) {
      console.error('Error fetching cards:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCards = () => {
    let filtered = [...cards]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        card.english.toLowerCase().includes(query) ||
        card.chinese.toLowerCase().includes(query) ||
        card.part_of_speech.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'alpha') {
      filtered.sort((a, b) => a.english.localeCompare(b.english))
    } else {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredCards(filtered)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-600">Loading all cards...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          All Vocabulary
        </h1>
        <p className="text-gray-600">
          Browse and search across all your cards
        </p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by English, Chinese, or part of speech..."
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="alpha">A-Z</option>
              <option value="date">Date Added</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredCards.length} of {cards.length} cards
        </div>
      </div>

      {filteredCards.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-600">
            {searchQuery ? 'No cards match your search' : 'No cards found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="card p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {card.english}
                  </h3>
                  <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {card.part_of_speech}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{card.chinese}</p>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {card.notebook?.name || 'Unknown notebook'}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  card.status === 'new' ? 'bg-blue-50 text-blue-700' :
                  card.status === 'normal' ? 'bg-gray-100 text-gray-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {card.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
