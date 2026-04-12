import { useCallback, useEffect, useMemo, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import Board from "../components/Board"
import type { Game, PlayerInfo } from "../../../server/src/game/games"

export default function Game() {
  const [players, setPlayers] = useState<Record<string, PlayerInfo>>({})
  const [maxGuesses, setMaxGuesses] = useState(6)
  const [gameStatus, setGameStatus] = useState("waiting")

  const [currentGuess, setCurrentGuess] = useState("")
  const [cursorIndex, setCursorIndex] = useState(0)

  const params = useParams()
  const navigate = useNavigate()

  const me = socket.id ? players[socket.id] : undefined
  const opponents = useMemo(() => {
    return Object.entries(players).filter(([id]) => id !== socket.id)
  }, [players])


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

    socket.on("update_game_state", (gameState) => {
      setPlayers(gameState.players)
      setMaxGuesses(gameState.maxGuesses)
      setGameStatus(gameState.status)
    })

    return () => {
      socket.off("broadcast")
      socket.off("update_game_state")
    }
  }, [])

  const submitGuess = (guess: string) => {
    socket.emit("submit_guess", guess, (response) => {
      if (response.status === "error") {
        return console.error(response.errorMessage)
      }
      setCurrentGuess("")
      setCursorIndex(0)
    })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== "playing") {
      return
    }

    switch (e.key) {
      case "ArrowLeft":
        return setCursorIndex((prev) => Math.max(0, prev - 1))

      case "ArrowRight":
        return setCursorIndex((prev) => Math.min(4, prev + 1))

      case "Backspace":
        return setCurrentGuess((prev) => {
          const arr = prev.padEnd(5, " ").split("")
          let idx = cursorIndex

          if (arr[idx] === " " && idx > 0) {
            idx--
            setCursorIndex(idx)
          }

          arr[idx] = " "
          return arr.join("").trimEnd()
        })
      
      case "Enter":
        return submitGuess(currentGuess)

      default:
        if (/^[a-zA-Z]$/.test(e.key)) {
          setCurrentGuess((prev) => {
            const arr = prev.padEnd(5, " ").split("")
            arr[cursorIndex] = e.key.toUpperCase()
            return arr.join("").trimEnd()
          })
        setCursorIndex((prev) => Math.min(4, prev + 1))  
        }
    }
  }, [currentGuess, cursorIndex, gameStatus])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="w-screen max-w-full h-screen max-h-full flex justify-center items-center gap-10">
      {me && (
        <div className="flex flex-col items-center">
          <p className="w-full text-center truncate">{`${socket.id} (${me.score})`}</p>
          <Board 
            currentGuess={currentGuess}
            playerGuesses={me.guesses}
            maxGuesses={maxGuesses}
            cursorIndex={cursorIndex}
            setCursorIndex={setCursorIndex}
            size={5}
          />
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
        {opponents.map(([id, player]) => (
          <div key={id} className="flex flex-col items-center">
            <p className="w-full text-center truncate">{`${id} (${player.score})`}</p>
            <Board
              playerGuesses={player.guesses}
              maxGuesses={maxGuesses}
              currentGuess=""
              cursorIndex={-1}
              size={opponents.length <= 6 ? 3 : 2}
            />
          </div>
        ))}
      </div>

    </div>
  )
}

