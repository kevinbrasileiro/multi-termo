import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import Board from "../components/Board"
import type { Game, PlayerInfo } from "../../../server/src/game/games"

export default function Game() {
  const [players, setPlayers] = useState<Record<string, PlayerInfo>>({})

  const [currentGuess, setCurrentGuess] = useState("")
  const guessRef = useRef(currentGuess)

  const [cursorIndex, setCursorIndex] = useState(0)
  const cursorRef = useRef(cursorIndex)

  const [gameStatus, setGameStatus] = useState<Game["status"]>("waiting")
  const statusRef = useRef(gameStatus)

  const params = useParams()
  const navigate = useNavigate()


  useEffect(() => {
    guessRef.current = currentGuess
    cursorRef.current = cursorIndex
    statusRef.current = gameStatus
  }, [cursorIndex, currentGuess, gameStatus])

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
      setGameStatus(gameState.status)
      statusRef.current = gameState.status
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current !== "playing") {
        return
      }
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

  const sortedPlayers = Object.entries(players).sort(([idA], [idB]) => {
    if (idA === socket.id) return -1
    if (idB === socket.id) return 1
    return 0
  })

  const [me , ...opponents] = sortedPlayers


  return (
    <div className="w-screen h-screen flex justify-center items-center gap-10">
      {me && (
        (() => {
          const [id, player] = me
          return (
            <div className="flex flex-col items-center">
              <p>{id} - {player.score}</p>
              <Board 
                currentGuess={currentGuess}
                playerGuesses={player.guesses}
                cursorIndex={cursorIndex}
                setCursorIndex={setCursorIndex}
                size={5}
              />
            </div>
          )
        })()
      )}

      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
        {opponents.map(([id, player]) => (
          <div key={id} className="flex flex-col items-center">
            <div>{id} - {player.score}</div>
            <Board
              playerGuesses={player.guesses}
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

