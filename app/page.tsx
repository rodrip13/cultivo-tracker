"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Thermometer, Droplets, Calendar, Clock, LogOut, Users, BarChart3, Leaf } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { supabase, type WeatherRecord, IS_SUPABASE_CONFIGURED } from "@/lib/supabase"
import { LoginForm } from "@/components/login-form"
import { EvolutionChart } from "@/components/evolution-chart"

export default function WeatherTracker() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [records, setRecords] = useState<WeatherRecord[]>([])
  const [temperature, setTemperature] = useState("")
  const [humidity, setHumidity] = useState("")
  const [status, setStatus] = useState<"green" | "yellow" | "red">("green")
  const [isLoading, setIsLoading] = useState(false)

  // Cargar registros desde Supabase o datos mock
  const loadRecords = async () => {
    if (!IS_SUPABASE_CONFIGURED) {
      setRecords([]) // Sin datos mock, solo array vacío
      return
    }
    try {
      const { data, error } = await supabase
        .from("weather_records")
        .select(`
      *,
      users (
        username,
        full_name
      )
    `)
        .order("recorded_at", { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.log("Error loading records:", error?.message || error)
      console.error("Error loading records:", error)
    }
  }

  // Agregar nuevo registro
  const addRecord = async () => {
    if (!temperature || !humidity || !currentUser) return

    if (!IS_SUPABASE_CONFIGURED) {
      // Modo mock: agregar al estado local (sin datos previos)
      const newRecord: WeatherRecord = {
        id: `new-${Date.now()}-${Math.random()}`,
        user_id: `user-${currentUser}`,
        temperature: Number.parseFloat(temperature),
        humidity: Number.parseFloat(humidity),
        status,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        users: { username: currentUser, full_name: currentUser },
      }
      setRecords([newRecord, ...records])
      setTemperature("")
      setHumidity("")
      setStatus("green")
      return
    }

    setIsLoading(true)
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("username", currentUser)
        .single()

      if (userError) throw userError

      const { error } = await supabase.from("weather_records").insert([
        {
          user_id: userData.id,
          temperature: Number.parseFloat(temperature),
          humidity: Number.parseFloat(humidity),
          status,
          recorded_at: new Date().toISOString(),
        },
      ])

      if (error) throw error

      await loadRecords()
      setTemperature("")
      setHumidity("")
      setStatus("green")
    } catch (error) {
      console.error("Error adding record:", error)
      alert("Error al agregar registro")
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar registro
  const deleteRecord = async (id: string) => {
    if (!IS_SUPABASE_CONFIGURED) {
      setRecords(records.filter((r) => r.id !== id))
      return
    }
    try {
      const { error } = await supabase.from("weather_records").delete().eq("id", id)
      if (error) throw error
      await loadRecords()
    } catch (error) {
      console.error("Error deleting record:", error)
      alert("Error al eliminar registro")
    }
  }

  // Cargar registros al iniciar sesión
  useEffect(() => {
    if (currentUser) {
      loadRecords()
    }
  }, [currentUser])

  const getStatusColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "bg-emerald-500"
      case "yellow":
        return "bg-amber-500"
      case "red":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "Óptimo 🌿"
      case "yellow":
        return "Moderado 🍃"
      case "red":
        return "Crítico 🚨"
      default:
        return "Desconocido"
    }
  }

  const getStatusGradient = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "from-emerald-400 to-green-600"
      case "yellow":
        return "from-amber-400 to-orange-500"
      case "red":
        return "from-red-400 to-red-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  // Mostrar formulario de login si no hay usuario
  if (!currentUser) {
    return <LoginForm onLogin={setCurrentUser} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">🌿 Grow Tracker</h1>
              <p className="text-sm text-green-100">Hola, {currentUser} 👋</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentUser(null)}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Mostrar información sobre datos demo */}
        {!IS_SUPABASE_CONFIGURED && (
          <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">⚠️ Modo Demo</p>
            <p className="text-xs text-amber-600">
              Conecta Supabase para persistir datos. Los registros se perderán al recargar.
            </p>
          </div>
        )}

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="add"
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4" />
              Registrar
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger
              value="evolution"
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Nuevo Registro de Cultivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="flex items-center gap-2 text-green-700 font-medium">
                      <Thermometer className="w-4 h-4" />
                      Temperatura (°C)
                    </Label>
                    <Input
                      id="temperature"
                      type="number"
                      placeholder="24.5"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="humidity" className="flex items-center gap-2 text-green-700 font-medium">
                      <Droplets className="w-4 h-4" />
                      Humedad (%)
                    </Label>
                    <Input
                      id="humidity"
                      type="number"
                      placeholder="65"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-green-700 font-medium">Estado del Cultivo</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Óptimo */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="green"
                        checked={status === "green"}
                        onChange={(e) => setStatus(e.target.value as "green" | "yellow" | "red")}
                        className="sr-only"
                      />
                      <div
                        className={`
                        p-4 rounded-xl border-2 transition-all duration-200 
                        ${
                          status === "green"
                            ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-100 shadow-lg transform scale-105"
                            : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${status === "green" ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}
                          `}
                          >
                            {status === "green" && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🌿</span>
                            <div>
                              <div className="font-semibold text-emerald-700">Óptimo</div>
                              <div className="text-sm text-emerald-600">Condiciones perfectas para el crecimiento</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Moderado */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="yellow"
                        checked={status === "yellow"}
                        onChange={(e) => setStatus(e.target.value as "green" | "yellow" | "red")}
                        className="sr-only"
                      />
                      <div
                        className={`
                        p-4 rounded-xl border-2 transition-all duration-200 
                        ${
                          status === "yellow"
                            ? "border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-100 shadow-lg transform scale-105"
                            : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50"
                        }
                      `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${status === "yellow" ? "border-amber-500 bg-amber-500" : "border-gray-300"}
                          `}
                          >
                            {status === "yellow" && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🍃</span>
                            <div>
                              <div className="font-semibold text-amber-700">Moderado</div>
                              <div className="text-sm text-amber-600">Requiere atención y ajustes</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Crítico */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="red"
                        checked={status === "red"}
                        onChange={(e) => setStatus(e.target.value as "green" | "yellow" | "red")}
                        className="sr-only"
                      />
                      <div
                        className={`
                        p-4 rounded-xl border-2 transition-all duration-200 
                        ${
                          status === "red"
                            ? "border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg transform scale-105"
                            : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50"
                        }
                      `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${status === "red" ? "border-red-500 bg-red-500" : "border-gray-300"}
                          `}
                          >
                            {status === "red" && <div className="w-3 h-3 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🚨</span>
                            <div>
                              <div className="font-semibold text-red-700">Crítico</div>
                              <div className="text-sm text-red-600">Acción inmediata requerida</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={addRecord}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg"
                  disabled={!temperature || !humidity || isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? "Registrando..." : "🌱 Registrar Datos"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle>📊 Historial de Cultivo ({records.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {records.length === 0 ? (
                  <div className="text-center py-8 text-green-600">
                    <Leaf className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No hay registros aún</p>
                    <p className="text-sm text-green-500">¡Comienza a registrar tu cultivo! 🌱</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full bg-gradient-to-r ${getStatusGradient(record.status)} shadow-sm`}
                          ></div>
                          <div>
                            <div className="flex items-center gap-4 text-sm font-medium">
                              <span className="flex items-center gap-1 text-red-600">
                                <Thermometer className="w-3 h-3" />
                                {record.temperature}°C
                              </span>
                              <span className="flex items-center gap-1 text-blue-600">
                                <Droplets className="w-3 h-3" />
                                {record.humidity}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(record.recorded_at), "dd/MM/yyyy", { locale: es })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(record.recorded_at), "HH:mm", { locale: es })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                {getStatusText(record.status)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                👤 {record.users?.full_name || "Usuario"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {/* Botón de borrar visible solo para Rodri */}
                        {currentUser === "rodri" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evolution">
            <EvolutionChart records={records} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
