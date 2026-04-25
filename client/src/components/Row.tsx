import type { GuessResult } from "../../../server/src/game/types"

type RowProps = {
  guess: GuessResult
  cursorIndex: number
  onCellClick?: (index: number) => void
  size: "sm" | "md" | "lg"
}

export default function Row({guess, cursorIndex, onCellClick, size = "lg"}: RowProps) {
  const bgStyles = {
    correct: "bg-correct",
    present: "bg-present",
    wrong: "bg-wrong",
    empty: "bg-dark"
  }

  const sizeStyles = {
    sm: "text-2xl size-8",
    md: "text-3xl size-12",
    lg: "text-5xl size-20",
  }

  return (
    <div className="flex">
      {guess.map((character, i) => (
        <div
        key={i}
        onClick={() => onCellClick?.(i)}
        className={
          `flex m-1 border-wrong-light border rounded-sm justify-center items-center font-extrabold
          ${sizeStyles[size]} 
          ${bgStyles[character.result]}
          ${cursorIndex === i ? "border-b-4" : "border-b"}
          ${onCellClick ? "cursor-pointer" : "cursor-default"}`
        }
        >
          {character.letter}
        </div>
      ))}
    </div>
  )
}