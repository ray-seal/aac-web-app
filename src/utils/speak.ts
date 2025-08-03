// src/utils/speak.ts
export const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  speechSynthesis.speak(utterance)
}
