import { useEffect } from "react"
import { socket } from "../socket"
import { useNavigate } from "react-router"

export default function App() {
  const navigate = useNavigate()

  useEffect(() => {
    socket.on("room_created", (roomId) => {
      navigate(`/room/${roomId}`)
    })

    socket.on("broadcast", (message) => {
      console.log(message)
    })

    return () => {
      socket.off("room_created")
      socket.off("broadcast")
    }
  }, [navigate])

  const createRoom = () => {
    socket.emit("create_room")
  }

  const joinRoom = () => {
    socket.emit("join_room", "aaaaaa")
  }

  return (
    <>
      <button onClick={createRoom}>Create Room</button>
      <button onClick={joinRoom}>Join Room</button>
    </>
  )
}

