import { useEffect, useState,useMemo} from 'react'
import axios from 'axios'
import './AssessmentResults.css'
import QuestionItem from './QuestionItem'
import QuestionDetailModal from './QuestionDetailModal'
import ScoreChart from './ScoreChart'

interface AssessmentResults {
  instance: {
    id: string
    completed: boolean
    completed_at: string | null
    element: string
  }
  total_questions: number
  answered_questions: number
  completion_percentage: number
  scores: {
    total_score: number
    max_score: number
    percentage: number
  }
  element_scores: Record<string, any>
  insights: Array<{
    type: string
    message: string
    positive: boolean
  }>
}

interface Props {
  instanceId: string
}

// Interface for each question typed
export interface QuestionAnswer{
  question_id: string
  question_sequence: number
  question_title: string
  is_answered: boolean
  is_reflection: boolean
  reflection_prompt: string | null
  answer_value: number | null
  max_score:number
  option_number?:number
  answer_text: string | null
  text_answer?:string
}

export default function AssessmentResults({ instanceId }: Props) {
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion]=useState<QuestionAnswer | null>(null)

  useEffect(() => {
    if (!instanceId) return

    const fetchResults = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8002'}/api/assessment/results/${instanceId}`
        )
        setResults(response.data)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load assessment results')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [instanceId])


   //Question level data transformation function

   const derivedResult= useMemo(() => {
    if(!results) return null
    const element = Object.values(results.element_scores)[0]
    let questions=element.question_answers


     //transform data for the Bar chart
     //Based on how question answered, unanswered or reflection or not
     const scorePerQuestion = questions.map((q) => {
      const isAttempted = q.is_answered ?? false
    
      if (q.is_reflection) {
        return {
          name: `R${q.question_sequence}`,
          score: 0, // visual placeholder only
          maxScore: null,
          type: 'reflection',
          isAttempted
        }
      }
    
      return {
        name: `Q${q.question_sequence}`,
        score: isAttempted ? q.answer_value ?? 0 : 0,
        maxScore: q.max_score ?? 5,
        type: 'question',
        isAttempted
      }
    })

    

  
    
     
    return {
      
    
      filteredQuestions: questions,
      scorePerQuestion
    }

   


  },[results])

  if (loading) {
    return <div className="loading">Loading results...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  if (!results) {
    return <div className="empty">No results to display</div>
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#27ae60'
    if (percentage >= 60) return '#f39c12'
    return '#e74c3c'
  }

  return (
    <div className="assessment-results">
      <div className="results-header">
        <h2>Assessment Results - Element {results.instance.element}</h2>
        <p className="instance-id">Instance: {results.instance.id}</p>
      </div>

      {/* Progress Card */}
      <div className="card progress-card">
        <h3>Progress</h3>
        <div className="progress-circle">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#3498db"
              strokeWidth="12"
              strokeDasharray={`${(results.completion_percentage / 100) * 339.292} 339.292`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="progress-text">
            <span className="progress-percentage">{results.completion_percentage}%</span>
            <span className="progress-label">Complete</span>
          </div>
        </div>
        <div className="progress-details">
          <p>{results.answered_questions} of {results.total_questions} questions answered</p>
        </div>
      </div>

      {/* Score Card */}
      <div className="card score-card">
        <h3>Overall Score</h3>
        <div className="score-display">
          <div
            className="score-percentage"
            style={{ color: getScoreColor(results.scores.percentage) }}
          >
            {results.scores.percentage}%
          </div>
          <div className="score-details">
            <p>{results.scores.total_score} / {results.scores.max_score} points</p>
            <p className="score-note">Normalized from 1-5 scale</p>
          </div>
        </div>
      </div>

      {/* Element Scores */}
      {Object.keys(results.element_scores).length > 0 && (
        <div className="card element-scores-card">
          <h3>Scores by Element</h3>
          <div className="element-scores">
            {Object.values(results.element_scores).map((elementScore: any) => (
              <div key={elementScore.element} className="element-score">
                <div className="element-header">
                  <span className="element-name">Element {elementScore.element}</span>
                  <span
                    className="element-percentage"
                    style={{ color: getScoreColor(elementScore.scores.percentage) }}
                  >
                    {elementScore.scores.percentage}%
                  </span>
                </div>
                <div className="element-progress-bar">
                  <div
                    className="element-progress-fill"
                    style={{
                      width: `${elementScore.completion_percentage}%`,
                      backgroundColor: getScoreColor(elementScore.scores.percentage)
                    }}
                  />
                </div>
                <div className="element-details">
                  <span>{elementScore.answered_questions} / {elementScore.total_questions} answered</span>
                  <span>{elementScore.scores.total_score} / {elementScore.scores.max_score} points</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar Chart */}

      {derivedResult && (
       <ScoreChart data={derivedResult.scorePerQuestion} />
      )}


       {/* Question Breakdown Component */}

       <div className="card">
        <h3>Question Breakdown</h3>
        {derivedResult.filteredQuestions.length === 0 && <div className="empty">No questions match filter.</div>}
        {derivedResult.filteredQuestions.map(q => (
          <QuestionItem key={q.question_id} question={q} onClick={() => setSelectedQuestion(q)} />
        ))}
      </div>

      {/* Insights */}
      {results.insights.length > 0 && (
        <div className="card insights-card">
          <h3>Insights</h3>
          <div className="insights">
            {results.insights.map((insight, index) => (
              <div
                key={index}
                className={`insight ${insight.positive ? 'positive' : 'negative'}`}
              >
                <span className="insight-type">{insight.type}</span>
                <p className="insight-message">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}


      {/*Each question model detail */}

      {selectedQuestion && (
        <QuestionDetailModal question={selectedQuestion} onClose={()=>setSelectedQuestion(null)}/>
      )}
    </div>
  )
}
