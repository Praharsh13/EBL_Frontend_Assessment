import React, { Suspense, lazy } from 'react'


interface ChartData {
    name: string
    score: number
    maxScore: number | null
    type: 'question' | 'reflection'
    isAttempted: boolean
  }
  
  interface ScoreChartProps {
    data: ChartData[]
  }
const Chart = lazy(() => import('./ChartInner'))

const ScoreChart = ({ data }: ScoreChartProps) => {
  return (
    <div className="score-chart-container">
      <h3 className="score-chart-title">
        Score Per Question (Q = Question, R = Reflection)
      </h3>

      <div className="chart-legend">
        <div><span className="legend-box high"></span> High (80%+)</div>
        <div><span className="legend-box medium"></span> Medium (60–79%)</div>
        <div><span className="legend-box low"></span> Low (&lt;60%)</div>
        <div><span className="legend-box unanswer"></span> Unattempted</div>
        <div><span className="legend-box reflection"></span> Reflection Attempted</div>
       
      </div>


      <Suspense fallback={<p>Loading chart...</p>}>
        <Chart data={data}
         />
      </Suspense>
    </div>
  )
}

export default ScoreChart