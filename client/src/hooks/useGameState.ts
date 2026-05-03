import { useEffect, useMemo, useState } from "react"
import { socket } from "../socket"
import type { GameState,} from "../../../server/src/game/types"

export function useGameState() {
    const [gameState, setGameState] = useState<GameState>({
      players: {},
      status: "waiting",
      word: "",
      config: {maxPlayers: 2, maxGuesses: 6, mode: "guesses", private: true, password: ""},
      startedAt: 0
    })

    const me = socket.id ? gameState.players[socket.id] : undefined
    const opponents = useMemo(() => {
      return Object.entries(gameState.players).filter(([id]) => id !== socket.id)
    }, [gameState.players])

    const sortedPlayers = useMemo(() => {
      if (gameState.status !== "finished") return []

      return Object.entries(gameState.players).sort((a, b) => b[1].score.total - a[1].score.total)

    }, [gameState.players, gameState.status])

  useEffect(() => {
    const handler = (gameState: GameState) => {
      setGameState(gameState)
    }

    socket.on("update_game_state", handler)

    return () => {
      socket.off("update_game_state", handler)
    }
  }, [])
  

  return {
    me,
    opponents,
    sortedPlayers,

    gameStatus: gameState.status,
    gameWord: gameState.word,
    gameConfig: gameState.config,
    gameStartedAt: gameState.startedAt,
  }
}