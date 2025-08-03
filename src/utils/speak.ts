// src/utils/speak.ts
export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) {
    alert('Sorry, your browser does not support speech synthesis.')
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB' // You can customize this
  utterance.rate = 1 // Speed (0.1 to 10)
  utterance.pitch = 1 // Pitch (0 to 2)
  utterance.volume = 1 // Volume (0 to 1)

  window.speechSynthesis.cancel() // Optional: cancel any queued speech
  window.speechSynthesis.speak(utterance)
}
