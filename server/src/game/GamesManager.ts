import { Game } from "./Game.js"
import type { GameConfig, JoinGameResponse } from "./types.js"

class GamesManager {
  private games = new Map<string, Game>()

  getGame(gameId: string) {
    return this.games.get(gameId)
  }

  createGame(playerId: string, username: string, config: GameConfig): string {
    const gameId = Math.random().toString(36).substring(2, 8)
    
    const game = new Game(gameId, playerId, username, config)
    this.games.set(gameId, game)

    return gameId
  }

  joinGame(playerId: string, gameId: string, username: string, password: string | null): JoinGameResponse {
    const game = this.games.get(gameId)
    if (!game) return "not_found"

    return game.join(playerId, username, password)
  }

  leaveGame(playerId: string, gameId: string) {
    const game = this.games.get(gameId)
    if (!game) return

    const result = game.leave(playerId)

    if (result === "delete") {
      this.games.delete(gameId)
    }
  }
}

export const gamesManager = new GamesManager()