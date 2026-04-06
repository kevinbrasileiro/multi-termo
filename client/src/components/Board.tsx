import type { GuessResult } from "../../../server/src/game/wordle"
import Row from "./Row"

type BoardProps = {
  playerGuesses: GuessResult[]
  currentGuess: string
  cursorIndex: number
  setCursorIndex: (index: number) => void
  size: number
}

export default function Board({playerGuesses, currentGuess, cursorIndex, setCursorIndex, size}: BoardProps) {
  const currentRow: GuessResult = Array.from(
    { length: 5 },
    (_, i) => ({
      letter: currentGuess[i] ?? "",
      result: "empty" as const, 
    })
  )

  const filledGuesses: GuessResult[] = [
    ...playerGuesses,
    ...(playerGuesses.length < 6 ? [currentRow] : []),
    ...Array.from(
      {
        length: 6 - playerGuesses.length - (playerGuesses.length < 6 ? 1 : 0),
      },
      () =>
        Array.from({ length: 5 }, () => ({
          letter: "",
          result: "empty" as const
        }))
    ),
  ]

  return (
    <div>
      {filledGuesses.map((guess, i) => (
        <Row 
          guess={guess} 
          cursorIndex={i === playerGuesses.length ? cursorIndex : -1}
          onCellClick={i === playerGuesses.length ? setCursorIndex : undefined}
          size={size}
        />
      ))}
    </div>
  )
}