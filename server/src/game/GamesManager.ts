import { Game } from "./Game.js"
import type { GameConfig, JoinGameResponse } from "./types.js"

const GAMEID_CREATION_TRIES = 10
const GAMEID_SIZE = 6

class GamesManager {
  private games = new Map<string, Game>()

  getGame(gameId: string) {
    return this.games.get(gameId)
  }

  createGame(playerId: string, username: string, config: GameConfig): string {
    let gameId = ""
    for (let i = 0; i < GAMEID_CREATION_TRIES; i++) {
      const possibleId = Math.random().toString(36).substring(2, GAMEID_SIZE + 2)

      if (!this.games.has(possibleId)) {
        gameId = possibleId
        break
      }
    }

    if (!gameId) throw new Error(`could not generate valid game id after ${GAMEID_CREATION_TRIES} tries`)
    
    const game = new Game(gameId, playerId, username, config)
    this.games.set(gameId, game)

    return gameId
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