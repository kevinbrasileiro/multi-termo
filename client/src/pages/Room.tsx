import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import type { GuessResult } from "../../../server/src/game/wordle"
import Board from "../components/Board"

export default function Room() {
  const [currentGuess, setCurrentGuess] = useState("")
  const [playerGuesses, setPlayerGuesses] = useState<GuessResult[]>([])
  const [cursorIndex, setCursorIndex] = useState(0)

  const [opponentGuessAmount, setOpponentGuessAmount] = useState(0)

  const params = useParams()
  const navigate = useNavigate()

  const cursorRef = useRef(cursorIndex)
  const guessRef = useRef(currentGuess)

  useEffect(() => {
    cursorRef.current = cursorIndex
    guessRef.current = currentGuess
  }, [cursorIndex, currentGuess])

  useEffect(() => {
    socket.emit("join_room", params.roomId ?? "", (response) => {
      if (response.status === "error") {
        console.error(response.errorMessage)
        navigate("/")
      }
    })
  }, [params.roomId, navigate])

  useEffect(() => {
    socket.on("broadcast", (message) => {
      console.log(message)
    })

    socket.on("opponent_guess", (amount: number) => {
      console.log(`opponent has sent ${amount} guesses`)
      setOpponentGuessAmount(amount)
    })

    return () => {
      socket.off("broadcast")
      socket.off("opponent_guess")
    }
  })

  const submitGuess = (guess: string) => {
    socket.emit("submit_guess", guess, (response) => {
      setPlayerGuesses(response)
    })
    setCurrentGuess("")
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
          const arr = prev.split("")
          arr[cursorRef.current] = " "
          return arr.join("")
        })
        setCursorIndex((prev) => Math.max(0, prev - 1))
      } else if (e.key === "Enter") {
        submitGuess(guessRef.current)
        setCursorIndex(0)
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
    <div className="w-full h-full">
      <Board 
        playerGuesses={playerGuesses} 
        currentGuess={currentGuess} 
        cursorIndex={cursorIndex} 
        setCursorIndex={setCursorIndex}
        />
        {opponentGuessAmount}
    </div>
  )
}

