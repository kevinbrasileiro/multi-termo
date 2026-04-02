import { evaluateGuess, type GuessResult } from "./wordle.js"

export type Room = {
  id: string
  players: string[]
  word: string
  playerGuesses: Record<string, string[]>
  status: "waiting" | "playing" | "finished"
}

class RoomsManager {
  private rooms = new Map<string, Room>()

  public getRoom(roomId: string) {
    return this.rooms.get(roomId)
  }

  public createRoom(playerId: string): string {
    const roomId = Math.random().toString(36).substring(2, 8)

    this.rooms.set(roomId, {
      id: roomId,
      players: [playerId],
      word: "RAIOS",
      playerGuesses: {},
      status: "waiting"
    })

    console.log(`${roomId} created`)
    console.dir(this.rooms)
    return roomId
  }

  public joinRoom(playerId: string, roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    if (room.players.includes(playerId)) return

    room.players.push(playerId)
    console.log(`${playerId} joined ${room.id}`)
    console.dir(this.rooms)
  }

  public submitGuess(playerId: string, roomId: string , guess: string): GuessResult {
    const room = this.rooms.get(roomId)
    if (!room) return []

    if (!room.playerGuesses[playerId]) {
      room.playerGuesses[playerId] = []
    }

    room.playerGuesses[playerId].push(guess)
    
    console.log(`${playerId}@${room.id} guessed ${guess}`)
    console.dir(this.rooms)
    return evaluateGuess(guess, room.word)
  }
}

export const roomsManager = new RoomsManager()