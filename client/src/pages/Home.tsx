import { socket } from "../socket"
import { useNavigate } from "react-router"

export default function App() {
  const navigate = useNavigate()

  const createRoom = () => {
    socket.emit("create_room", (roomId) => {
      navigate(`/room/${roomId}`)
    })
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <button className="border-white border py-2 px-3 rounded-md cursor-pointer" onClick={createRoom}>Create Room</button>
    </div>
  )
}

