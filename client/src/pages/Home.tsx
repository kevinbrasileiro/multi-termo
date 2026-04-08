import { socket } from "../socket"
import { useNavigate } from "react-router"

export default function App() {
  const navigate = useNavigate()

  const createGame = () => {
    socket.emit("create_game", (gameId) => {
      navigate(`/game/${gameId}`)
    })
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <button className="border-white border py-2 px-3 rounded-md cursor-pointer" onClick={createGame}>Create Game</button>
    </div>
  )
}

