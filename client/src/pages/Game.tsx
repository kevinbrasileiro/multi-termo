import { useCallback, useEffect, useState } from "react"
import { socket } from "../socket"
import { useParams } from "react-router"
import Board from "../components/Board"
import Modal from "../components/Modal"
import { useJoinGame } from "../hooks/useJoinGame"
import { Input } from "../components/generic/Input"
import { useGameState } from "../hooks/useGameState"

export default function Game() {  
  const [currentGuess, setCurrentGuess] = useState("")
  const [cursorIndex, setCursorIndex] = useState(0)

  const [isErrorShake, setIsErrorShake] = useState(false)
  const [guessError, setGuessError] = useState("")

  const params = useParams()

  const {password, setPassword, showPasswordModal, joinWithPassword, passwordError} = useJoinGame(params.gameId ?? "")
  const {me, opponents, sortedPlayers, gameStatus, gameWord, gameConfig} = useGameState()


  const voteRematch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    socket.emit("vote_rematch")
  }

  const submitGuess = (guess: string) => {
    socket.emit("submit_guess", guess, (response) => {
      if (response.status === "error") {
        setGuessError(response.errorMessage || "")
        setTimeout(() => {
          setGuessError("")
        }, 3000)

        setIsErrorShake(false)
        requestAnimationFrame(() => {
          setIsErrorShake(true)
        })

        return
      }

      setGuessError("")
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
        <div className={`flex flex-col items-center ${isErrorShake ? "animate-shake" : ""}`}>
          <p className="w-full text-center truncate">{`${me.username} (${me.score.total})`}</p>
          <Board 
            currentGuess={currentGuess}
            playerGuesses={me.guesses}
            maxGuesses={gameConfig.maxGuesses}
            cursorIndex={cursorIndex}
            setCursorIndex={setCursorIndex}
            size={5}
            guessError={guessError}
          />
        </div>
      )}
      {opponents.length > 0 && (<div className="max-h-full">
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl py-4">
          {opponents.map(([id, player]) => (
            <div key={id} className={`flex flex-col items-center ${(player.win || player.guesses.length >= gameConfig.maxGuesses )? "opacity-50" : ""} ${opponents.length <= 6 ? "w-70" : "w-50"}`}>
              <p className="w-full text-center truncate">{`${player.username} (${player.score.total})`}</p>
              <Board
                playerGuesses={player.guesses}
                maxGuesses={gameConfig.maxGuesses}
                currentGuess=""
                cursorIndex={-1}
                size={opponents.length <= 6 ? 3 : 2}
              />
            </div>
          ))}
        </div>
      </div>)}

      <Modal isOpen={gameStatus === "waiting"}>
        <div className="w-full h-full flex flex-col gap-4 items-center">
          <p>Esperando jogadores... {opponents.length + 1}/{gameConfig.maxPlayers} </p>
        </div>
      </Modal>

      <Modal isOpen={showPasswordModal}>
        <div className="w-full flex flex-col items-center gap-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            label="Senha"
          />
          <button onClick={joinWithPassword} className="w-1/3 py-2 px-3 rounded-md border transition-colors duration-150  border-white text-white hover:bg-white hover:text-black cursor-pointer">Entrar</button>
        </div>
      </Modal>

      <Modal isOpen={gameStatus === "finished"} expandable>
        <div className="w-full h-full flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <h2 className={`text-2xl font-bold text-center ${me?.win ? "text-correct" : "text-danger"}`}>RESULTADOS</h2>
            {me?.win ? (
            <p className="text-center">
              Você acertou a palavra <span className="font-bold">{gameWord}</span> em {me.guesses.length} tentativas
            </p>
            ) : (
            <p className="text-center">
              Você não pontuou. A palavra era <span className="font-bold">{gameWord}</span>
            </p>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-4">
            {sortedPlayers.map(([id, player], index) => {
              const isMe = id === socket.id

              return (
                <div key={id} className={
                  `flex justify-between items-center px-4 py-2 rounded-lg ${player.votedRematch ? "bg-correct" : "bg-wrong"}
                  ${isMe ? "border border-white" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{index + 1}</span>
                    <span>{isMe ? "You" : player.username}</span>
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

