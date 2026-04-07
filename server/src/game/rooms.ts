import type { Response } from "../socket/socketEvents.js"
import { evaluateGuess, generateRandomWord, guessExists, type GuessResult } from "./wordle.js"

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
      word: generateRandomWord(),
      playerGuesses: {},
      status: "waiting"
    })

    console.log(`${roomId} created`)
    console.dir(this.rooms)
    return roomId
  }

  joinRoom(playerId: string, roomId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    if (!room.players.includes(playerId)) {    
      room.players.push(playerId)
      console.log(`${playerId} joined ${room.id}`)
      console.dir(this.rooms)
    }
    
    return true
  }

  submitGuess(playerId: string, roomId: string , guess: string): Response & {guesses: GuessResult[]}  {
    const room = this.rooms.get(roomId)
    if (!room) return {
      status: "error",
      errorMessage: "Not in a room",
      guesses: []
    }

    if (!room.playerGuesses[playerId]) {
      room.playerGuesses[playerId] = []
    }

    if (guess.length !== 5) {
      return { status: "error", errorMessage: "Invalid length", guesses: room.playerGuesses[playerId] }
    }

    if (room.playerGuesses[playerId].length >= 6) {
      return { status: "error", errorMessage: "Guesses limit reached", guesses: room.playerGuesses[playerId]}
    }

    if (!guessExists(guess)) {
      return { status: "error", errorMessage: "Word cannot be accepted", guesses: room.playerGuesses[playerId]}
    }

    const result = evaluateGuess(guess, room.word)
    room.playerGuesses[playerId].push(result)
    
    console.log(`${playerId}@${room.id} guessed ${guess}`)
    console.dir(this.rooms)

    return {
      status: "ok",
      guesses: room.playerGuesses[playerId]
    }
  }
}

export const roomsManager = new RoomsManager()