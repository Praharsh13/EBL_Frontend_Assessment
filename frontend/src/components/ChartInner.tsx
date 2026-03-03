import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface ChartData {
  name: string
  score: number
  maxScore: number | null
  type: 'question' | 'reflection'
  isAttempted: boolean
}

interface Props {
  data: ChartData[]
}

const getScoreColor = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100

  if (percentage >= 80) return '#27ae60'
  if (percentage >= 60) return '#f39c12'
  return '#e74c3c'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const item = payload[0].payload

  if (item.type === 'reflection') {
    return (
      <div className="chart-tooltip">
        <strong>{item.name}</strong>
        <p>Type: Reflection</p>
        <p>Status: {item.isAttempted ? 'Attempted' : 'Not Attempted'}</p>
      </div>
    )
  }

  return (
    <div className="chart-tooltip">
      <strong>{item.name}</strong>
      <p>Status: {item.isAttempted ? 'Attempted' : 'Not Attempted'}</p>
      {item.isAttempted && (
        <p>Score: {item.score} / {item.maxScore}</p>
      )}
    </div>
  )
}

const ChartInner = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 5]} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((item, index) => {
            let color = '#ccc'

            if (item.type === 'reflection') {
              color = item.isAttempted ? '#8e44ad' : '#d2b4de'
            } else {
              if (!item.isAttempted) {
                color = '#bdc3c7'
              } else {
                color = getScoreColor(item.score, item.maxScore!)
              }
            }

            return <Cell key={index} fill={color} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ChartInner