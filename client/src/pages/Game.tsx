import { useCallback, useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import Board from "../components/Board"
import type { Game, PlayerInfo } from "../../../server/src/game/games"

export default function Game() {
  const [players, setPlayers] = useState<Record<string, PlayerInfo>>({})
  const [maxGuesses, setMaxGuesses] = useState(6)

  const [currentGuess, setCurrentGuess] = useState("")
  const guessRef = useRef(currentGuess)

  const [cursorIndex, setCursorIndex] = useState(0)
  const cursorRef = useRef(cursorIndex)

  const statusRef = useRef("waiting")

  const params = useParams()
  const navigate = useNavigate()


  useEffect(() => {
    guessRef.current = currentGuess
    cursorRef.current = cursorIndex
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

    socket.on("update_game_state", (gameState) => {
      setPlayers(gameState.players)
      setMaxGuesses(gameState.maxGuesses)
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (statusRef.current !== "playing" ) {
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
    else if (/^[a-zA-Z]$/.test(e.key)) {
      setCurrentGuess((prev) => {
        const arr = prev.padEnd(5, " ").split("")
        arr[cursorRef.current] = e.key.toUpperCase()
        return arr.join("").trimEnd()
      })

      setCursorIndex((prev) => Math.min(4, prev + 1))
    }
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

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
                maxGuesses={maxGuesses}
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

