export type GuessResult = {letter: string, result: "correct" | "present" | "wrong"}[]

export const evaluateGuess = (guess: string, targetWord: string): GuessResult => {
  const splitGuess = guess.toUpperCase().split("")
  const splitTargetWord = targetWord.toUpperCase().split("")
  const result: GuessResult = []

  const frequencies: Record<string, number> = {}
  const greenLettersIndexes: number[] = []

  splitTargetWord.forEach((letter) => {
    frequencies[letter] = (frequencies[letter] || 0) + 1
  })

  splitGuess.forEach((letter, i) => {
    if (letter === splitTargetWord[i]) {
      result[i] = {letter, result: "correct"}
      frequencies[letter]! -= 1
      greenLettersIndexes.push(i)
      return
    }
  })

  splitGuess.forEach((letter, i) => {
    if (greenLettersIndexes.includes(i)) return

    if (frequencies[letter]! > 0 && splitTargetWord.includes(letter)) {
      result[i] = {letter, result: "present"}
      frequencies[letter]! -= 1
      return
    }

    result[i] = {letter, result: "wrong"}
  })

  return result
} 