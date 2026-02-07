import { useCallback } from 'react'

export function useSpeech() {
  const speak = useCallback((text) => {
    // 停止當前的語音（如果有的話）
    window.speechSynthesis.cancel()

    // 創建語音實例
    const utterance = new SpeechSynthesisUtterance(text)
    
    // 設定為美式英文
    utterance.lang = 'en-US'
    utterance.rate = 1  // 語速（0.1-10，1 是正常速度）
    utterance.pitch = 1.2   // 音調（0-2，1 是正常音調）
    utterance.volume = 1  // 音量（0-1）

    // 播放語音
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
  }, [])

  return { speak, stop }
}