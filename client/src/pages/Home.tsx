import { useState } from "react"
import { Input } from "../components/generic/Input"
import { socket } from "../socket"
import { useNavigate } from "react-router"
import { Radio } from "../components/generic/Radio"
import { getUsername } from "../main"
import type { GameConfig } from "../../../server/src/game/types"
import Button from "../components/generic/Button"
import Modal from "../components/Modal"

export default function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig>({maxPlayers: 2, maxGuesses: 6, mode: "guesses", password: null})
  const [username, setUsername] = useState(getUsername())

  const [showCreateModal, setShowCreateModal] = useState(false)

  const navigate = useNavigate()

  const createGame = () => {
    socket.emit("create_game", username, gameConfig, (gameId) => {
      navigate(`/game/${gameId}`)
    })
  }

  const redirectToRandomGame = () => {
    socket.emit("get_random_game", (gameId) => {
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
      <div className="w-72 flex flex-col gap-4">
        <Input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            localStorage.setItem("username", e.target.value)
          }}
          label="Nome de Usuário"
        />

        <div className="w-full flex gap-2">
          <Button variant="primary" size="md" fullWidth onClick={() => setShowCreateModal(true)}>Criar Jogo</Button>
          <Button variant="primary" size="md" fullWidth onClick={redirectToRandomGame}>Entrar Jogo</Button>
        </div>

      </div>
        

      <Modal isOpen={showCreateModal} handleOutsideClick={() => setShowCreateModal(false)}>
        <div className="w-full h-full flex flex-col gap-4 items-center">

          <div className="w-full flex justify-between gap-4">
            <Input 
              type="number"
              min={1}
              max={99}
              value={gameConfig.maxPlayers}
              onChange={(e) => handleGameConfigChange("maxPlayers", parseFloat(e.target.value))}
              label="nº de Jogadores"
              className="text-center"
            />
            <Input 
              type="number"
              min={3}
              max={9}
              value={gameConfig.maxGuesses}
              onChange={(e) => handleGameConfigChange("maxGuesses", parseFloat(e.target.value))}
              label="Qtde de Tentativas"
              className="text-center"
            />
          </div>

          <Radio 
            name="mode"
            label="Modo de Jogo"
            value={gameConfig.mode}
            onChange={(option) => handleGameConfigChange("mode", option)}
            options={[
              {label: "Tentativas", value: "guesses"},
              {label: "Tempo", value: "timed"},
            ]}
          />

          <div className="w-full">
            <Input 
              type="password"
              value={gameConfig.password || ""}
              onChange={(e) => handleGameConfigChange("password", e.target.value)}
              label="Senha"
            />
            <p className="text-xs opacity-50 mt-1">Deixar vazio fará o jogo ser público</p>
          </div>

          <Button onClick={createGame} size="lg" fullWidth>Criar Jogo</Button>

        </div>
      </Modal>
    </div>
  )
}

