export type Room = {
  id: string
  players: string[]
  word: string
  playerGuesses: Record<string, string[]>
  status: "waiting" | "playing" | "finished"
}

class RoomsManager {
  private rooms = new Map<string, Room>()

  public createRoom(playerId: string) {
    const roomId = Math.random().toString(36).substring(2, 8)

    this.rooms.set(roomId, {
      id: roomId,
      players: [],
      word: "Raios",
      playerGuesses: {},
      status: "waiting"
    })

    return roomId
  }

  joinRoom(playerId: string, roomId: string) {
    const room = this.rooms.get(roomId)

    if (!room) return
    if (room.players.includes(playerId)) return

    room.players.push(playerId)

    return room
  }

  addGuess(playerId: string, roomId: string , guess: string) {
    const room = this.rooms.get(roomId)

    if (!room) return
    room.playerGuesses[playerId]?.push(guess)
  }
}

export const roomsManager = new RoomsManager()