export type GuessResult = {value: string, result: "correct" | "present" | "wrong"}[]

export const evaluateGuess = (guess: string, targetWord: string): GuessResult => {
  // TODO: CHECK WORD LOGIC

  return [
    {value: "R", result: "correct"},
    {value: "A", result: "present"},
    {value: "I", result: "wrong"},
    {value: "O", result: "wrong"},
    {value: "S", result: "correct"},
  ]
}