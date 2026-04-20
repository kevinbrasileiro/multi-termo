import { useCallback, useEffect, useMemo, useState } from "react"
import { socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import Board from "../components/Board"
import type { PlayerInfo } from "../../../server/src/game/games"
import Modal from "../components/Modal"
import { getUsername } from "../main"

export default function Game() {
  const [players, setPlayers] = useState<Record<string, PlayerInfo>>({})
  const [maxGuesses, setMaxGuesses] = useState(6)
  const [gameStatus, setGameStatus] = useState("waiting")
  const [resultWord, setResultWord] = useState("")

  const [currentGuess, setCurrentGuess] = useState("")
  const [cursorIndex, setCursorIndex] = useState(0)

  const [error, setError] = useState(false)

  const params = useParams()
  const navigate = useNavigate()

  const me = socket.id ? players[socket.id] : undefined
  const opponents = useMemo(() => {
    return Object.entries(players).filter(([id]) => id !== socket.id)
  }, [players])

  const sortedPlayers = useMemo(() => {
    if (gameStatus !== "finished") return []

    return Object.entries(players).sort((a, b) => b[1].score.total - a[1].score.total)

  }, [players, gameStatus])

  useEffect(() => {
    if (!params.gameId) return

    socket.emit("join_game", getUsername(), params.gameId, (response) => {
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
      setResultWord(gameState.word)
    })

    return () => {
      socket.off("broadcast")
      socket.off("update_game_state")
    }
  }, [])

  const voteRematch = () => {
    socket.emit("vote_rematch")
  }

  const submitGuess = (guess: string) => {
    socket.emit("submit_guess", guess, (response) => {
      if (response.status === "error") {
        setError(false)
        requestAnimationFrame(() => {
          setError(true)
        })
        return
      }
      setCurrentGuess("")
      setCursorIndex(0)
    })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== "playing" || me?.win) {
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
  }, [currentGuess, cursorIndex, gameStatus, me])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="w-screen h-screen flex justify-center items-center gap-10 overflow-y-auto">
      {me && (
        <div className={`flex flex-col items-center ${error ? "animate-shake" : ""}`}>
          <p className="w-full text-center truncate">{`${me.username} (${me.score.total})`}</p>
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
      {opponents.length > 0 && (<div className="max-h-full">
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl py-4">
          {opponents.map(([id, player]) => (
            <div key={id} className={`flex flex-col items-center ${(player.win || player.guesses.length >= maxGuesses )? "opacity-50" : ""} ${opponents.length <= 6 ? "w-70" : "w-50"}`}>
              <p className="w-full text-center truncate">{`${player.username} (${player.score.total})`}</p>
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
      </div>)}

      <Modal isOpen={gameStatus === "finished"}>
        <div className="w-full h-full flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <h2 className={`text-2xl font-bold text-center ${me?.win ? "text-correct" : "text-danger"}`}>RESULTADOS</h2>
            {me?.win ? (
            <p className="text-center">
              Você acertou a palavra <span className="font-bold">{resultWord}</span> em {me.guesses.length} tentativas
            </p>
            ) : (
            <p className="text-center">
              Você não pontuou. A palavra era <span className="font-bold">{resultWord}</span>
            </p>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-4">
            {sortedPlayers.map(([id, player], index) => {
              const isMe = id === socket.id

              return (
                <div key={id} className={
                  `flex justify-between items-center px-4 py-2 rounded-lg bg-wrong 
                  ${isMe ? "border border-white" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{index + 1}</span>
                    <span className={player.votedRematch ? "text-correct" : "text-white"}>{isMe ? "You" : player.username}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <p className="text-xs opacity-50">+{player.score.round}</p>
                    <p className="text-xl font-bold">{player.score.total}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            disabled={me?.votedRematch}
            className={`
              py-2 px-3 rounded-md border transition-colors duration-150
              ${me?.votedRematch
                ? "bg-correct border-0 text-white cursor-default"
                : "border-white text-white hover:bg-white hover:text-black cursor-pointer"}
            `}
            onClick={voteRematch}
          >
            {me?.votedRematch ? "Waiting for others..." : "Rematch"}
          </button>

        </div>
      </Modal>
    </div>
  )
}

