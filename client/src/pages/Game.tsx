import { useCallback, useEffect, useState } from "react"
import { getPlayerId, socket } from "../socket"
import { useNavigate, useParams } from "react-router"
import Board from "../components/Board"
import Modal from "../components/Modal"
import { useJoinGame } from "../hooks/useJoinGame"
import { Input } from "../components/generic/Input"
import { useGameState } from "../hooks/useGameState"
import Button from "../components/generic/Button"

export default function Game() {  
  const [currentGuess, setCurrentGuess] = useState("")
  const [cursorIndex, setCursorIndex] = useState(0)

  const [errorShake, setErrorShake] = useState(false)
  const [guessError, setGuessError] = useState("")

  const [clipboardNotification, setClipboardNotification] = useState(false)

  const params = useParams()
  const navigate = useNavigate()

  const {password, setPassword, showPasswordModal, joinWithPassword, passwordError, joinError} = useJoinGame(params.gameId ?? "")
  const {me, setMyGuesses, opponents, sortedPlayers, gameStatus, gameWord, gameConfig, gameStartedAt} = useGameState()


  const voteRematch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    socket.emit("vote_rematch")
  }

  const submitGuess = useCallback((guess: string) => {
    socket.emit("submit_guess", guess, (response) => {
      switch (response.status) {
        case "incorrect_length":
          setGuessError("A palavra deve ter 5 letras")
          setErrorShake(true)
          setTimeout(() => setErrorShake(false), 500)
          return
        case "not_on_wordlist":
          setGuessError("A palavra não pode ser aceita")
          setErrorShake(true)
          setTimeout(() => setErrorShake(false), 500)
          return
        
        case "ok":
          setMyGuesses(response.guesses)
          setGuessError("")
          setCurrentGuess("")
          setCursorIndex(0)
          return

        default:
          console.error(response)
          navigate("/")
          return
      }
    })
  }, [navigate, setMyGuesses])

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
  }, [currentGuess, cursorIndex, gameStatus, me, submitGuess])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    window.addEventListener("beforeunload", (e) => e.preventDefault())
    window.addEventListener("popstate", () => {
      socket.emit("leave_game")
    })
  })

  return (
    <div className="w-screen h-screen flex justify-center items-center gap-10 overflow-y-auto">
      {me && (
        <div className={`flex flex-col items-center ${errorShake ? "animate-shake" : ""}`}>
          <p className="w-full text-center truncate">{`${me.username} (${me.score.total})`}</p>
          <Board 
            currentGuess={currentGuess}
            playerGuesses={me.guesses}
            maxGuesses={gameConfig.maxGuesses}
            cursorIndex={cursorIndex}
            setCursorIndex={setCursorIndex}
            size={"lg"}
            guessError={guessError}
          />
        </div>
      )}
      {opponents.length > 0 && (<div className="max-h-full">
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl py-4">
          {opponents.map(([id, player]) => (
            <div key={id} className={`flex flex-col items-center ${(player.win || player.guesses.length >= gameConfig.maxGuesses )? "opacity-50" : ""} ${opponents.length <= 6 ? "w-70" : "w-50"}`}>
              <p className={`w-full text-center truncate ${player.connected ? "" : "text-danger"}`}>{`${player.username} (${player.score.total})`}</p>
              <Board
                playerGuesses={player.guesses}
                maxGuesses={gameConfig.maxGuesses}
                currentGuess=""
                cursorIndex={-1}
                size={opponents.length <= 6 ? "md" : "sm"}
              />
            </div>
          ))}
        </div>
      </div>)}

      <Modal isOpen={gameStatus === "waiting" && !showPasswordModal}>
        <div className="w-full h-full flex flex-col gap-4 items-center">

          <h2 className="text-2xl font-bold">Aguardando Jogadores... {opponents.length + 1}/{gameConfig.maxPlayers}</h2>

          <div className="relative flex flex-col items-center gap-1">
            <p className="text-xs opacity-50">Convide seus amigos usando o link</p>
            <div
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href)
                setClipboardNotification(true)
                setTimeout(() => setClipboardNotification(false), 1500)
              }}
              className="flex items-center justify-center bg-zinc-800 px-3 py-2 rounded-lg cursor-pointer gap-x-1"
            >
              {window.location.href}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>

            <p className={
              `absolute top-[40%] left-1/2 -translate-x-1/2 text-xs bg-correct px-3 py-2 rounded-full transition-opacity duration-200 
              ${clipboardNotification ? "opacity-100" : "opacity-0"}
            `}>
              Copiado!
            </p>
            </div>

          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {opponents.map((player) => (
              <div className="bg-wrong-light px-3 py-2 text-xs rounded-full">{player[1].username}</div>
            ))}
          </div>

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
          <Button className="w-1/3" onClick={joinWithPassword}>Entrar</Button>
        </div>
      </Modal>

      <Modal isOpen={!!joinError}>
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-danger text-center text-lg tracking-widest">{joinError}</p>
          <Button className="w-1/3" onClick={() => navigate("/")}>Voltar</Button>
        </div>
      </Modal>

      <Modal isOpen={gameStatus === "finished"} expandable>
        <div className="w-full h-full flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <h2 className={`text-2xl font-bold text-center ${me?.win ? "text-correct" : "text-danger"}`}>RESULTADOS</h2>
            {me?.win ? (
            <p className="text-center">
              Você acertou a palavra <span className="font-bold">{gameWord}</span> em 
              {gameConfig.mode === "guesses" 
              ? ` ${me.guesses.length} tentativas` 
              : ` ${((me.win - gameStartedAt) / 1000).toFixed(2)} segundos`
              }
            </p>
            ) : (
            <p className="text-center">
              Você não pontuou. A palavra era <span className="font-bold">{gameWord}</span>
            </p>
            )}
          </div>

          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto px-4">
            {sortedPlayers.map(([id, player], index) => {
              const isMe = id === getPlayerId()

              return (
                <div key={id} className={
                  `flex justify-between items-center px-4 py-2 rounded-lg ${player.votedRematch ? "bg-correct" : "bg-wrong"}
                  ${isMe ? "border border-white" : ""}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{index + 1}</span>
                    <span>{isMe ? "Você" : player.username}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <p className="text-xs opacity-50">+{player.score.round}</p>
                    <p className="text-xl font-bold">{player.score.total}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            disabled={me?.votedRematch}
            onClick={voteRematch}
          >
            {me?.votedRematch ? "Esperando outros jogadores..." : "Jogar Novamente"}
          </Button>

        </div>
      </Modal>
    </div>
  )
}

