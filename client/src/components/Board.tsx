import type { GuessResult } from "../../../server/src/game/types"
import Row from "./Row"

type BoardProps = {
  playerGuesses: GuessResult[]
  maxGuesses: number
  currentGuess: string
  cursorIndex: number
  size: "sm" | "md" | "lg"
  setCursorIndex?: (index: number) => void
  guessError?: string
}

export default function Board({playerGuesses, maxGuesses, currentGuess, cursorIndex, size, setCursorIndex, guessError}: BoardProps) {
  const currentRow: GuessResult = Array.from(
    { length: 5 },
    (_, i) => ({
      letter: currentGuess[i] ?? "",
      result: "empty" as const, 
    })
  )

  const filledGuesses: GuessResult[] = [
    ...playerGuesses,
    ...(playerGuesses.length < maxGuesses ? [currentRow] : []),
    ...Array.from(
      {
        length: maxGuesses - playerGuesses.length - (playerGuesses.length < maxGuesses ? 1 : 0),
      },
      () =>
        Array.from({ length: 5 }, () => ({
          letter: "",
          result: "empty" as const
        }))
    ),
  ]

  return (
    <div className="relative">
      {filledGuesses.map((guess, i) => (
        <Row 
          key={i}
          guess={guess} 
          cursorIndex={i === playerGuesses.length ? cursorIndex : -1}
          onCellClick={i === playerGuesses.length ? setCursorIndex : undefined}
          size={size}
        />
      ))}
      {guessError && (
        <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs text-danger">{guessError}</p>
      )}
    </div>
  )
}