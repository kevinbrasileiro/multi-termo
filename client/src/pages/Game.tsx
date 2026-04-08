import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import type { GuessResult } from "../../../server/src/game/wordle"
import Board from "../components/Board"

export default function Game() {
  const [currentGuess, setCurrentGuess] = useState("")
  const [playerGuesses, setPlayerGuesses] = useState<GuessResult[]>([])
  const [cursorIndex, setCursorIndex] = useState(0)

  const [opponentGuesses, setOpponentGuesses] = useState<GuessResult[]>([])

  const params = useParams()
  const navigate = useNavigate()

  const cursorRef = useRef(cursorIndex)
  const guessRef = useRef(currentGuess)

  useEffect(() => {
    cursorRef.current = cursorIndex
    guessRef.current = currentGuess
  }, [cursorIndex, currentGuess])

  useEffect(() => {
    if (!params.gameId) return

    socket.emit("join_game", params.gameId, (response) => {
      if (response.status === "error") {
        console.error(response.errorMessage)
        navigate("/")
      }
    })
    
  }, [params.gameId, navigate])

  useEffect(() => {
    socket.on("broadcast", (message) => {
      console.log(message)
    })

    socket.on("opponent_guess", (guessResults) => {
      setOpponentGuesses(guessResults)
    })

    return () => {
      socket.off("broadcast")
      socket.off("opponent_guess")
    }
  })

  const submitGuess = (guess: string) => {
    socket.emit("submit_guess", guess, (response) => {
      if (response.status === "error") {
        return console.error(response.errorMessage)
      }
      setPlayerGuesses(response.guesses)
      setCurrentGuess("")
      setCursorIndex(0)
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCursorIndex((prev) => Math.max(0, prev - 1))
      } 
      else if (e.key === "ArrowRight") {
        setCursorIndex((prev) => Math.min(4, prev + 1))
      } 
      else if (e.key === "Backspace") {
        setCurrentGuess((prev) => {
          const arr = prev.padEnd(5, " ").split("")
          let idx = cursorRef.current

          if (arr[idx] === " " && idx > 0) {
            idx--
            setCursorIndex(idx)
          }

          arr[idx] = " "
          return arr.join("").trimEnd()
        })
      } else if (e.key === "Enter") {
        submitGuess(guessRef.current)
      } 
      else if (e.key.length === 1) {
        setCurrentGuess((prev) => {
          const arr = prev.padEnd(5, " ").split("")
          arr[cursorRef.current] = e.key.toUpperCase()
          return arr.join("").trimEnd()
        })

        setCursorIndex((prev) => Math.min(4, prev + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [])

  return (
    <div className="w-screen h-screen flex justify-center items-center gap-x-12">
      <Board 
        playerGuesses={playerGuesses} 
        currentGuess={currentGuess} 
        cursorIndex={cursorIndex} 
        setCursorIndex={setCursorIndex}
        size={5}
        />
      <Board 
        playerGuesses={opponentGuesses}
        currentGuess=""
        cursorIndex={-1}
        setCursorIndex={ () => {} }
        size={3}
      />
    </div>
  )
}

