/**
 * Spaced Repetition Memory (SRM) Algorithm
 * Implements the core logic for calculating next review dates
 */

export const CARD_STATUS = {
  NEW: 'new',
  NORMAL: 'normal',
  FAMILIAR: 'familiar'
}

/**
 * Calculate next review date based on button pressed
 * @param {Object} card - Current card state
 * @param {string} action - 'again', 'normal', or 'familiar'
 * @returns {Object} Updated card properties
 */
export function calculateNextReview(card, action) {
  const now = new Date()
  let updates = {}

  switch (action) {
    case 'again':
      // Card will reappear in current session, no DB update needed yet
      updates = {
        status: card.status,
        next_review_at: null, // Will be set after session
        current_interval: card.current_interval || 0,
        consecutive_familiar_count: 0
      }
      break

    case 'normal':
      // Review tomorrow
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      updates = {
        status: CARD_STATUS.NORMAL,
        next_review_at: tomorrow.toISOString(),
        current_interval: 1,
        consecutive_familiar_count: 0
      }
      break

    case 'familiar':
      // Progressive intervals: 2, 4, 8 days (max)
      const familiarCount = (card.consecutive_familiar_count || 0) + 1
      let interval
      
      if (familiarCount === 1) {
        interval = 2
      } else if (familiarCount === 2) {
        interval = 4
      } else {
        interval = 8 // Maximum interval
      }

      const nextReview = new Date(now)
      nextReview.setDate(nextReview.getDate() + interval)

      updates = {
        status: CARD_STATUS.FAMILIAR,
        next_review_at: nextReview.toISOString(),
        current_interval: interval,
        consecutive_familiar_count: familiarCount
      }
      break

    default:
      throw new Error(`Invalid action: ${action}`)
  }

  return updates
}

/**
 * Filter cards that are due for review
 * @param {Array} cards - Array of cards
 * @returns {Array} Cards due for review
 */
export function getDueCards(cards) {
  const now = new Date()
  
  return cards.filter(card => {
    // New cards are always due
    if (card.status === CARD_STATUS.NEW) {
      return true
    }
    
    // Cards with no next review date are due
    if (!card.next_review_at) {
      return true
    }
    
    // Check if review date has passed
    const reviewDate = new Date(card.next_review_at)
    return reviewDate <= now
  })
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
