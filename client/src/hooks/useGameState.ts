import { useEffect, useMemo, useState } from "react"
import { socket } from "../socket"
import type { GameConfig, GameState, PlayerInfo } from "../../../server/src/game/types"

export function useGameState() {
    const [players, setPlayers] = useState<Record<string, PlayerInfo>>({})

    const [gameStatus, setGameStatus] = useState("waiting")
    const [gameWord, setGameWord] = useState("")

    const [gameConfig, setGameConfig] = useState<GameConfig>({maxGuesses: 6, maxPlayers: 2, mode: "guesses", password: null})

    const me = socket.id ? players[socket.id] : undefined
    const opponents = useMemo(() => {
      return Object.entries(players).filter(([id]) => id !== socket.id)
    }, [players])

    const sortedPlayers = useMemo(() => {
      if (gameStatus !== "finished") return []

      return Object.entries(players).sort((a, b) => b[1].score.total - a[1].score.total)

    }, [players, gameStatus])

  useEffect(() => {
    const handler = (gameState: GameState) => {
      setPlayers(gameState.players)
      setGameStatus(gameState.status)
      setGameWord(gameState.word)
      setGameConfig({ ...gameState.config })
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

    gameStatus,
    gameWord,
    gameConfig,

  }
}