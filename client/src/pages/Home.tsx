import { useState } from "react"
import { Input } from "../components/generic/Input"
import { socket } from "../socket"
import { useNavigate } from "react-router"
import { Radio } from "../components/generic/Radio"
import { getUsername } from "../main"
import type { GameConfig } from "../../../server/src/game/types"

export default function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig>({maxPlayers: 2, maxGuesses: 6, mode: "guesses", password: null})
  const [username, setUsername] = useState(getUsername())

  const navigate = useNavigate()

  const createGame = () => {
    socket.emit("create_game", username, gameConfig, (gameId) => {
      localStorage.setItem("username", username)
      navigate(`/game/${gameId}`)
    })
  }

  const handleGameConfigChange = (field: string, value: string | number | boolean) => {
    setGameConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center gap-4">
      <div className="w-72">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Username"
        />
      </div>
      <div className="w-72 flex flex-col gap-8">
        <div className="flex justify-between gap-4">
          <Input 
            type="number"
            min={1}
            max={99}
            value={gameConfig.maxPlayers}
            onChange={(e) => handleGameConfigChange("maxPlayers", parseFloat(e.target.value))}
            label="Player Amount"
            className="text-center"
          />
          <Input 
            type="number"
            min={3}
            max={9}
            value={gameConfig.maxGuesses}
            onChange={(e) => handleGameConfigChange("maxGuesses", parseFloat(e.target.value))}
            label="Max Guesses"
            className="text-center"
          />
        </div>

        <Radio 
          name="mode"
          label="Game Mode"
          value={gameConfig.mode}
          onChange={(option) => handleGameConfigChange("mode", option)}
          options={[
            {label: "Guesses", value: "guesses"},
            {label: "Timed", value: "timed"},
          ]}
        />

        <Input 
          type="password"
          value={gameConfig.password || ""}
          onChange={(e) => handleGameConfigChange("password", e.target.value)}
          label="Password?"
        />

        <button className="border-wrong border-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-wrong transition-colors duration-150" onClick={createGame}>Create Game</button>
      </div>

    </div>
  )
}

