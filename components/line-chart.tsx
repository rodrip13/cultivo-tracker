"use client"

interface DataPoint {
  date: string
  temperature: number
  humidity: number
}

interface LineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
}

export function LineChart({ data, width = 300, height = 200 }: LineChartProps) {
  if (data.length === 0) return null

  const margin = { top: 20, right: 60, bottom: 40, left: 40 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // Encontrar valores min/max
  const tempValues = data.map((d) => d.temperature)
  const humidityValues = data.map((d) => d.humidity)

  const tempMin = Math.min(...tempValues)
  const tempMax = Math.max(...tempValues)
  const humidityMin = Math.min(...humidityValues)
  const humidityMax = Math.max(...humidityValues)

  // Evitar división por cero si todos los valores son iguales
  const tempRange = tempMax - tempMin === 0 ? 1 : tempMax - tempMin
  const humidityRange = humidityMax - humidityMin === 0 ? 1 : humidityMax - humidityMin

  // Escalas
  const xScale = (index: number) => (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2)
  const tempScale = (value: number) => chartHeight - ((value - tempMin) / tempRange) * chartHeight
  const humidityScale = (value: number) => chartHeight - ((value - humidityMin) / humidityRange) * chartHeight

  // Crear paths para las líneas
  const tempPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${tempScale(d.temperature)}`).join(" ")

  const humidityPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${humidityScale(d.humidity)}`).join(" ")

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-sm font-medium mb-4">Temperatura y Humedad por Fecha</h3>
      <svg width={width} height={height} className="overflow-visible">
        {/* Área del gráfico */}
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Líneas de cuadrícula */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={0}
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          ))}

          {/* Línea de temperatura */}
          <path d={tempPath} fill="none" stroke="#ef4444" strokeWidth={2} className="drop-shadow-sm" />

          {/* Línea de humedad */}
          <path d={humidityPath} fill="none" stroke="#06b6d4" strokeWidth={2} className="drop-shadow-sm" />

          {/* Puntos de temperatura */}
          {data.map((d, i) => (
            <circle
              key={`temp-${i}`}
              cx={xScale(i)}
              cy={tempScale(d.temperature)}
              r={3}
              fill="#ef4444"
              className="drop-shadow-sm"
            />
          ))}

          {/* Puntos de humedad */}
          {data.map((d, i) => (
            <circle
              key={`humidity-${i}`}
              cx={xScale(i)}
              cy={humidityScale(d.humidity)}
              r={3}
              fill="#06b6d4"
              className="drop-shadow-sm"
            />
          ))}

          {/* Etiquetas del eje X */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 4) === 0) {
              return (
                <text
                  key={`label-${i}`}
                  x={xScale(i)}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b7280"
                >
                  {new Date(d.date).toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })}
                </text>
              )
            }
            return null
          })}
        </g>

        {/* Leyenda */}
        <g transform={`translate(${width - 55}, 30)`}>
          <circle cx={0} cy={0} r={3} fill="#ef4444" />
          <text x={8} y={4} fontSize={10} fill="#374151">
            Temp
          </text>
          <circle cx={0} cy={15} r={3} fill="#06b6d4" />
          <text x={8} y={19} fontSize={10} fill="#374151">
            Hum
          </text>
        </g>

        {/* Escalas Y */}
        <g transform={`translate(${margin.left - 5}, ${margin.top})`}>
          <text x={0} y={0} textAnchor="end" fontSize={10} fill="#ef4444">
            {tempMax.toFixed(1)}°
          </text>
          <text x={0} y={chartHeight} textAnchor="end" fontSize={10} fill="#ef4444">
            {tempMin.toFixed(1)}°
          </text>
        </g>

        <g transform={`translate(${width - margin.right + 5}, ${margin.top})`}>
          <text x={0} y={0} textAnchor="start" fontSize={10} fill="#06b6d4">
            {humidityMax.toFixed(1)}%
          </text>
          <text x={0} y={chartHeight} textAnchor="start" fontSize={10} fill="#06b6d4">
            {humidityMin.toFixed(1)}%
          </text>
        </g>
      </svg>
    </div>
  )
}
