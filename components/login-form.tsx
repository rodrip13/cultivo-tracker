"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogIn, Leaf } from "lucide-react"

interface LoginFormProps {
  onLogin: (username: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [selectedUser, setSelectedUser] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const users = [
    { username: "rodri", name: "Rodri 🌿" },
    { username: "lucas", name: "Lucas 🍃" },
    { username: "nico", name: "Nico 🌱" },
  ]

  const handleLogin = async () => {
    if (!selectedUser || !password) return

    setIsLoading(true)

    // Simulamos validación (en producción sería con hash real)
    if (password === "123456") {
      onLogin(selectedUser)
    } else {
      alert("Contraseña incorrecta")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">🌿 Grow Tracker</CardTitle>
          <p className="text-green-100">Sistema de Monitoreo de Cultivo</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label className="text-green-700 font-medium">Seleccionar Cultivador</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
                <SelectValue placeholder="Elige tu usuario" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.username} value={user.username}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-green-700 font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="border-green-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg"
            disabled={!selectedUser || !password || isLoading}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? "Iniciando..." : "🚀 Acceder al Sistema"}
          </Button>

          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-2">🔐 Credenciales de Acceso</p>
              <p className="text-xs text-green-600">
                Contraseña para todos: <span className="font-mono bg-green-100 px-2 py-1 rounded">123456</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
