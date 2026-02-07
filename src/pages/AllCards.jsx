import { useState, useEffect } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import SpeakButton from '../components/SpeakButton'

export default function AllCards() {
  const [cards, setCards] = useState([])
  const [filteredCards, setFilteredCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('alpha') // 'alpha' or 'date'
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchAllCards()
  }, [])

  useEffect(() => {
    filterAndSortCards()
  }, [cards, searchQuery, sortBy, sortOrder])

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

  const getDaysUntilReview = (card) => {
    // New cards or cards without review date are highest priority (0 days)
    if (card.status === 'new' || !card.next_review_at) {
      return 0
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const reviewDate = new Date(card.next_review_at)
    const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate())
    
    // Calculate difference in days
    const diffInMs = reviewDay - today
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
    
    // If already due (negative or 0), return 0
    return diffInDays < 0 ? 0 : diffInDays
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
      filtered.sort((a, b) => {
        const result = a.english.localeCompare(b.english)
        return sortOrder === 'asc' ? result : -result
      })
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const result = new Date(b.created_at) - new Date(a.created_at)
        return sortOrder === 'asc' ? result : -result
      })
    } else if (sortBy === 'review') {
      filtered.sort((a, b) => {
        const daysA = getDaysUntilReview(a)
        const daysB = getDaysUntilReview(b)
        const result = daysA - daysB
        return sortOrder === 'asc' ? result : -result
      })
    } else if (sortBy === 'status') {
      filtered.sort((a, b) => {
        const statusOrder = { 'new': 0, 'normal': 1, 'familiar': 2 }
        const result = statusOrder[a.status] - statusOrder[b.status]
        return sortOrder === 'asc' ? result : -result
      })
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
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-100 hover:bg-gray-50 rounded-md transition-colors"
              title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
            >
              <ArrowUpDown className="w-5 h-5 text-gray-500" />
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="alpha">Alphabetical</option>
              <option value="date">Date Added</option>
              <option value="review">Days Until Review</option>
              <option value="status">Status</option>
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
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {card.english}
                  </h3>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {card.english}
                    </h3>
                    <SpeakButton text={card.english} size="sm" />
                  </div>

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
                <div>
                  <span>
                  {card.status !== 'new' && card.next_review_at ? (
                    <span className="text-xs text-gray-500 mr-3">
                      Review in <span className="font-bold">{getDaysUntilReview(card)}</span> day
                      {getDaysUntilReview(card) !== 1 ? 's' : ''}
                    </span>) : null}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    card.status === 'new' ? 'bg-blue-50 text-blue-700' :
                    card.status === 'normal' ? 'bg-gray-100 text-gray-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {card.status}
                  </span>
                </div>
                
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
