"use client"

interface StatusDataPoint {
  date: string
  status: "green" | "yellow" | "red"
}

interface StatusChartProps {
  data: StatusDataPoint[]
  width?: number
  height?: number
}

export function StatusChart({ data, width = 300, height = 120 }: StatusChartProps) {
  if (data.length === 0) return null

  const margin = { top: 20, right: 20, bottom: 40, left: 20 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const getStatusColor = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return "#22c55e"
      case "yellow":
        return "#eab308"
      case "red":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusY = (status: "green" | "yellow" | "red") => {
    switch (status) {
      case "green":
        return chartHeight * 0.8
      case "yellow":
        return chartHeight * 0.5
      case "red":
        return chartHeight * 0.2
      default:
        return chartHeight * 0.5
    }
  }

  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-sm font-medium mb-4">Estado por Fecha</h3>
      <svg width={width} height={height} className="overflow-visible">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Líneas de referencia */}
          <line
            x1={0}
            y1={chartHeight * 0.2}
            x2={chartWidth}
            y2={chartHeight * 0.2}
            stroke="#fecaca"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <line
            x1={0}
            y1={chartHeight * 0.5}
            x2={chartWidth}
            y2={chartHeight * 0.5}
            stroke="#fde68a"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <line
            x1={0}
            y1={chartHeight * 0.8}
            x2={chartWidth}
            y2={chartHeight * 0.8}
            stroke="#bbf7d0"
            strokeWidth={1}
            strokeDasharray="2,2"
          />

          {/* Línea conectando estados */}
          <path
            d={data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${getStatusY(d.status)}`).join(" ")}
            fill="none"
            stroke="#6b7280"
            strokeWidth={1}
            strokeDasharray="3,3"
          />

          {/* Puntos de estado */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(i)}
              cy={getStatusY(d.status)}
              r={6}
              fill={getStatusColor(d.status)}
              stroke="white"
              strokeWidth={2}
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

          {/* Etiquetas del eje Y */}
          <text x={-15} y={chartHeight * 0.2 + 4} textAnchor="middle" fontSize={10} fill="#ef4444">
            Malo
          </text>
          <text x={-15} y={chartHeight * 0.5 + 4} textAnchor="middle" fontSize={10} fill="#eab308">
            Regular
          </text>
          <text x={-15} y={chartHeight * 0.8 + 4} textAnchor="middle" fontSize={10} fill="#22c55e">
            Bueno
          </text>
        </g>
      </svg>
    </div>
  )
}
