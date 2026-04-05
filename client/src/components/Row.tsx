import type { GuessResult } from "../../../server/src/game/wordle"

type RowProps = {
  guess: GuessResult
  cursorIndex: number
  onCellClick?: (index: number) => void
}

export default function Row({guess, cursorIndex, onCellClick}: RowProps) {
  const bgStyles = {
    correct: "bg-correct",
    present: "bg-present",
    wrong: "bg-wrong",
    empty: "bg-dark"
  }

  return (
    <div className="flex">
      {guess.map((character, i) => (
        <div
        onClick={() => onCellClick?.(i)}
        className={
          `w-10 h-10 flex m-1 border border-gray-500 rounded-sm justify-center items-center font-extrabold text-3xl 
          ${bgStyles[character.result]}
          ${cursorIndex === i ? "border-b-4" : "border"}
          ${onCellClick ? "cursor-pointer" : "cursor-default"}`
        }
        >
          {character.letter}
        </div>
      ))}
    </div>
  )
}