import type { GuessResult } from "../../../server/src/game/wordle"

type RowProps = {
  guess: GuessResult
  cursorIndex: number
  onCellClick?: (index: number) => void
  size: number
}

export default function Row({guess, cursorIndex, onCellClick, size = 5}: RowProps) {
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
        key={i}
        onClick={() => onCellClick?.(i)}
        style={{width: `${size}rem`, height: `${size}rem`}}
        className={
          `flex m-1 border-[#444] border rounded-sm justify-center items-center font-extrabold text-5xl
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