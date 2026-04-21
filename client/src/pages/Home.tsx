import { useState } from "react"
import { Input } from "../components/generic/Input"
import { socket } from "../socket"
import { useNavigate } from "react-router"
import { Radio } from "../components/generic/Radio"
import type { Game } from "../../../server/src/game/games"
import { getUsername } from "../main"

export default function App() {
  const [gameConfig, setGameConfig] = useState<Game["config"]>({maxPlayers: 2, maxGuesses: 6, mode: "guesses", private: true})
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

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={gameConfig.private}
            onChange={(e) =>
              handleGameConfigChange("private", e.target.checked)
            }
            className="hidden"
          />

          <span
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors
              ${gameConfig.private ? "bg-correct" : "bg-wrong"}
            `}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200
                ${gameConfig.private ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </span>

          <span>Private</span>
        </label>

        <button className="border-wrong border-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-wrong transition-colors duration-150" onClick={createGame}>Create Game</button>
      </div>

    </div>
  )
}

