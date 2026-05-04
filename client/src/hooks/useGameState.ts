import { useEffect, useMemo, useRef, useState } from "react"
import { getPlayerId, socket } from "../socket"
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

  const playerId = getPlayerId()
  const me = gameState.players[playerId]

  const opponents = useMemo(() => {
    return Object.entries(gameState.players).filter(([id]) => id !== playerId)
  }, [gameState.players, playerId])

  const sortedPlayers = useMemo(() => {
    if (gameState.status !== "finished") return []

    return Object.entries(gameState.players).sort((a, b) => b[1].score.total - a[1].score.total)

  }, [gameState.players, gameState.status])

  const lastGameAt = useRef(0)
  const storageKey = useRef("")
  
  useEffect(() => {
    const updateGameState = (newGameState: GameState) => {
      const newKey = `guesses:${newGameState.startedAt}`

      if (lastGameAt.current === 0) {
        lastGameAt.current = newGameState.startedAt
        storageKey.current = newKey

        const savedGuesses = window.localStorage.getItem(newKey)
        if (savedGuesses) {
          setMyGuesses(JSON.parse(savedGuesses))
        }
      }

      if (lastGameAt.current !== newGameState.startedAt) {
        localStorage.removeItem(storageKey.current)
        setMyGuesses([])
        lastGameAt.current = newGameState.startedAt
        storageKey.current = newKey
      }

      setGameState(newGameState)
    }

    socket.on("update_game_state", updateGameState)

    return () => {
      socket.off("update_game_state", updateGameState)
    }
  }, [])

  useEffect(() => {
    if (!storageKey.current) return

    localStorage.setItem(storageKey.current, JSON.stringify(myGuesses))
  }, [myGuesses])
  
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