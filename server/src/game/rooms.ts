export type Room = {
  id: string
  players: string[]
  word: string
}

class RoomsManager {
  private rooms = new Map<string, Room>()

  public createRoom(playerId: string) {
    // const roomId = Math.random().toString(36).substring(2, 8)
    const roomId = "aaaaaa"

    this.rooms.set(roomId, {
      id: roomId,
      players: [playerId],
      word: "Raios"
    })

    return roomId
  }

  joinRoom(playerId: string, roomId: string) {
    const room = this.rooms.get(roomId)

    if (!room) return

    room.players.push(playerId)

    return room
  }
}

export const roomsManager = new RoomsManager()