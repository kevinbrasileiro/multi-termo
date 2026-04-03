import { evaluateGuess, type GuessResult } from "./wordle.js"

export type Room = {
  id: string
  players: string[]
  word: string
  playerGuesses: Record<string, GuessResult[]>
  status: "waiting" | "playing" | "finished"
}

class RoomsManager {
  private rooms = new Map<string, Room>()

  getRoom(roomId: string) {
    return this.rooms.get(roomId)
  }

  createRoom(playerId: string): string {
    const roomId = Math.random().toString(36).substring(2, 8)

    this.rooms.set(roomId, {
      id: roomId,
      players: [playerId],
      word: "MESMA",
      playerGuesses: {},
      status: "waiting"
    })

    console.log(`${roomId} created`)
    console.dir(this.rooms)
    return roomId
  }

  joinRoom(playerId: string, roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    if (room.players.includes(playerId)) return

    room.players.push(playerId)
    console.log(`${playerId} joined ${room.id}`)
    console.dir(this.rooms)
  }

  submitGuess(playerId: string, roomId: string , guess: string): GuessResult[] {
    const room = this.rooms.get(roomId)
    if (!room) return []

    if (!room.playerGuesses[playerId]) {
      room.playerGuesses[playerId] = []
    }

    // TODO: add guess validation

    const result = evaluateGuess(guess, room.word)
    room.playerGuesses[playerId].push(result)
    
    console.log(`${playerId}@${room.id} guessed ${guess}`)
    console.dir(this.rooms)
    return room.playerGuesses[playerId]
  }

  getOpponentId(playerId: string, roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return 

    const opponentId = room.players.find(p => p !== playerId)
    if (!opponentId) return

    return opponentId
  }
}

export const roomsManager = new RoomsManager()