import { useEffect, useState } from "react"
import { socket } from "./socket"

export default function App() {
  const [guess, setGuess] = useState("")

  useEffect(() => {
    socket.on("room_created", (roomId) => {
      console.log(roomId)
    })

    socket.on("broadcast", (message) => {
      console.log(message)
    })

    return () => {
      socket.off("room_created")
      socket.off("broadcast")
    }
  }, [])

  const createRoom = () => {
    socket.emit("create_room")
  }

  const joinRoom = () => {
    socket.emit("join_room", "aaaaaa")
  }

  const submitGuess = () => {
    socket.emit("submit_guess", guess)
  }

  return (
    <>
      <button onClick={createRoom}>Create Room</button>
      <button onClick={joinRoom}>Join Room</button>

      <div>
        <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)}/>
        <button onClick={submitGuess}>Guess</button>
      </div>
    </>
  )
}

