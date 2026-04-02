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

    socket.on("guess_result", (result: GuessResult) => {
      setPlayerGuesses(prev => [...prev, result])
      console.log(result)
    })

    socket.on("guess_received", (playerId: string) => {
      console.log(`${playerId} sent a guess`)
      if (playerId === socket.id) return
      setOpponentGuessAmount(prev => prev + 1)
    })

    return () => {
      socket.off("broadcast")
      socket.off("guess_result")
      socket.off("guess_received")
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

