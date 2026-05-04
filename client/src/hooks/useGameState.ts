import { useEffect, useMemo, useRef, useState } from "react"
import { socket } from "../socket"
import type { GuessResult, GameState,} from "../../../server/src/game/types"

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    players: {},
    status: "waiting",
    word: "",
    config: {maxPlayers: 2, maxGuesses: 6, mode: "guesses", private: true, password: ""},
    startedAt: 0
  })

  const [myGuesses, setMyGuesses] = useState<GuessResult[]>([])

  const me = socket.id ? gameState.players[socket.id] : undefined
  const opponents = useMemo(() => {
    return Object.entries(gameState.players).filter(([id]) => id !== socket.id)
  }, [gameState.players])

  const sortedPlayers = useMemo(() => {
    if (gameState.status !== "finished") return []

    return Object.entries(gameState.players).sort((a, b) => b[1].score.total - a[1].score.total)

  }, [gameState.players, gameState.status])

  const lastGameAt = useRef(0)
  
  useEffect(() => {
    const updateGameState = (newGameState: GameState) => {

      if (lastGameAt.current === 0) {
        lastGameAt.current = newGameState.startedAt
      }
      if (lastGameAt.current !== newGameState.startedAt) {
        setMyGuesses([])
        lastGameAt.current = newGameState.startedAt
      }

      setGameState(newGameState)
    }

    socket.on("update_game_state", updateGameState)

    return () => {
      socket.off("update_game_state", updateGameState)
    }
  }, [])
  

  return {
    me: me ? {...me, guesses: myGuesses} : undefined,
    setMyGuesses,
    opponents,
    sortedPlayers,

    gameStatus: gameState.status,
    gameWord: gameState.word,
    gameConfig: gameState.config,
    gameStartedAt: gameState.startedAt,
  }
}