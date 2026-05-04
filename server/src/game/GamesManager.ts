import { Game } from "./Game.js"
import type { GameConfig, JoinGameResponse } from "./types.js"

const GAMEID_CREATION_TRIES = 10
const GAMEID_SIZE = 6

class GamesManager {
  private games = new Map<string, Game>()

  getGame(gameId: string) {
    return this.games.get(gameId)
  }

  getRandomPublicGame() {
    const publicGames = [...this.games].filter(([_, game]) => {
      return !game.config.private && game.config.password === null && game.status === "waiting"
    })

    const randomGame = publicGames[Math.floor(Math.random() * publicGames.length)]
    return randomGame?.[1]
  }

  createGame(config: GameConfig): string {
    let gameId = ""
    for (let i = 0; i < GAMEID_CREATION_TRIES; i++) {
      const possibleId = Math.random().toString(36).substring(2, GAMEID_SIZE + 2)

      if (!this.games.has(possibleId)) {
        gameId = possibleId
        break
      }
    }

    if (!gameId) throw new Error(`could not generate valid game id after ${GAMEID_CREATION_TRIES} tries`)
    
    const game = new Game(gameId, config)
    this.games.set(gameId, game)

    return gameId
  }

  leaveGame(playerId: string, gameId: string) {
    const game = this.games.get(gameId)
    if (!game) return

    game.leave(playerId)

    if (Object.keys(game.players).length <= 0) {
      this.games.delete(gameId)
    }
  }

  cleanupInactiveGames(timeout: number) {
    const now = Date.now()

    for (const [id, game] of this.games) {
      if (now - game.lastActivityAt > timeout) {
        console.log(`deleting game ${id} due to inactivity`)
        this.games.delete(id)
      }
    }
    
  }
}

export const gamesManager = new GamesManager()