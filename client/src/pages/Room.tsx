import { useEffect, useState } from "react"
import { socket } from "../socket"
import { useParams } from "react-router"
import type { GuessResult } from "../../../server/src/game/wordle"

export default function Room() {
  const [guess, setGuess] = useState("")
  const [playerGuesses, setPlayerGuesses] = useState<GuessResult[]>([])
  const [opponentGuessAmount, setOpponentGuessAmount] = useState(0)

  const params = useParams()

  useEffect(() => {
    socket.on("broadcast", (message) => {
      console.log(message)
    })

    if (params.roomId) {
      socket.emit("join_room", params.roomId)
    }

    socket.on("guess_result", (playerGuesses: GuessResult[]) => {
      setPlayerGuesses(playerGuesses)
      console.log(playerGuesses)
    })

    socket.on("opponent_guess", (amount: number) => {
      console.log(`opponent has sent ${amount} guesses`)
      setOpponentGuessAmount(amount)
    })

    return () => {
      socket.off("broadcast")
      socket.off("guess_result")
      socket.off("opponent_guess")
    }
  }, [params.roomId])

  const submitGuess = () => {
    socket.emit("submit_guess", guess)
  }

  return (
    <div>
      <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)}/>
      <button onClick={submitGuess}>Guess</button>
      <div>
        {playerGuesses?.map((guess, i) => (
          <div key={i}>
            {guess.map((letter, j) => (
              <span key={j}> {letter.value}</span>
            ))}
          </div>
        ))}
      </div>
      <div>Opponent Guesses: {opponentGuessAmount}</div>
    </div>
  )
}

