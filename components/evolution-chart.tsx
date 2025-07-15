"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"
import type { WeatherRecord } from "@/lib/supabase"
import { LineChart } from "./line-chart"
import { StatusChart } from "./status-chart"

interface EvolutionChartProps {
  records: WeatherRecord[]
}

type TimeFilter = "7days" | "1week" | "1month"

export function EvolutionChart({ records }: EvolutionChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7days")

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay datos suficientes para mostrar evolución</p>
          <p className="text-sm">Agrega más registros para ver las tendencias</p>
        </CardContent>
      </Card>
    )
  }

  // Filtrar datos según el período seleccionado
  const getFilteredData = () => {
    const now = new Date()
    let cutoffDate: Date

    switch (timeFilter) {
      case "7days":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "1week":
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "1month":
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    return records
      .filter((record) => new Date(record.recorded_at) >= cutoffDate)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
  }

  const filteredRecords = getFilteredData()

  // Preparar datos para gráficas
  const chartData = filteredRecords.map((record) => ({
    date: record.recorded_at,
    temperature: record.temperature,
    humidity: record.humidity,
  }))

  const statusData = filteredRecords.map((record) => ({
    date: record.recorded_at,
    status: record.status,
  }))

  // Calcular promedios
  const avgTemp =
    filteredRecords.length > 0 ? filteredRecords.reduce((sum, r) => sum + r.temperature, 0) / filteredRecords.length : 0
  const avgHumidity =
    filteredRecords.length > 0 ? filteredRecords.reduce((sum, r) => sum + r.humidity, 0) / filteredRecords.length : 0

  // Calcular tendencias
  const getTrend = (values: number[]) => {
    if (values.length < 2) return "stable"
    const first = values[0]
    const last = values[values.length - 1]
    const diff = last - first
    if (diff > 2) return "up"
    if (diff < -2) return "down"
    return "stable"
  }

  const tempTrend = getTrend(filteredRecords.map((r) => r.temperature))
  const humidityTrend = getTrend(filteredRecords.map((r) => r.humidity))

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-blue-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  // Contar estados
  const statusCounts = {
    green: filteredRecords.filter((r) => r.status === "green").length,
    yellow: filteredRecords.filter((r) => r.status === "yellow").length,
    red: filteredRecords.filter((r) => r.status === "red").length,
  }

  const getFilterLabel = () => {
    switch (timeFilter) {
      case "7days":
        return "Últimos 7 días"
      case "1week":
        return "Esta semana"
      case "1month":
        return "Este mes"
      default:
        return "Últimos 7 días"
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros de tiempo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Período de análisis</span>
            <span className="text-sm font-normal text-gray-500">{filteredRecords.length} registros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={timeFilter === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("7days")}
            >
              7 días
            </Button>
            <Button
              variant={timeFilter === "1week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("1week")}
            >
              Semana
            </Button>
            <Button
              variant={timeFilter === "1month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter("1month")}
            >
              Mes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promedios con tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Promedios - {getFilterLabel()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-red-600">{avgTemp.toFixed(1)}°C</span>
                <TrendIcon trend={tempTrend} />
              </div>
              <p className="text-sm text-gray-600">Temperatura</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-cyan-600">{avgHumidity.toFixed(1)}%</span>
                <TrendIcon trend={humidityTrend} />
              </div>
              <p className="text-sm text-gray-600">Humedad</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfica lineal de temperatura y humedad */}
      {chartData.length > 1 && <LineChart data={chartData} width={320} height={200} />}

      {/* Gráfica de estados */}
      {statusData.length > 1 && <StatusChart data={statusData} width={320} height={120} />}

      {/* Distribución de estados */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Estados - {getFilterLabel()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Buenos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{statusCounts.green}</span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width:
                        filteredRecords.length > 0 ? `${(statusCounts.green / filteredRecords.length) * 100}%` : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>Regulares</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{statusCounts.yellow}</span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width:
                        filteredRecords.length > 0 ? `${(statusCounts.yellow / filteredRecords.length) * 100}%` : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Malos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{statusCounts.red}</span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width:
                        filteredRecords.length > 0 ? `${(statusCounts.red / filteredRecords.length) * 100}%` : "0%",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
