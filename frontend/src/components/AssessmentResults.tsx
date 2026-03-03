import { useEffect, useState,useMemo} from 'react'
import axios from 'axios'
import './AssessmentResults.css'
import QuestionItem from './QuestionItem'
import QuestionDetailModal from './QuestionDetailModal'
import ScoreChart from './ScoreChart'
import AssessmentControls from './AssessmentControls'

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

// Interface for showing Element_score i.e 1.1,1.2 etc
export interface ElementScore {
  element: string
  total_questions: number
  answered_questions: number
  completion_percentage: number
  scores: {
    total_score: number
    max_score: number
    percentage: number
  }
  question_answers: QuestionAnswer[]
}

//Status logic
const getStatus = (completion: number) => {
  if (completion === 0) return 'Not Started'
  if (completion === 100) return 'Completed'
  return 'In Progress'
}

//helper function logic
const getScoreColor = (percentage: number) => {
  if (percentage >= 80) return '#27ae60'
  if (percentage >= 60) return '#f39c12'
  return '#e74c3c'
}

//Error
type ErrorType =
  | 'not-found'
  | 'generic'
  

interface Error {
  message: string
  type: ErrorType
}
export default function AssessmentResults({ instanceId }: Props) {
  const [results, setResults] = useState<AssessmentResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [selectedQuestion, setSelectedQuestion]=useState<QuestionAnswer | null>(null)
  const [statusFilter, setStatusFilter] =
    useState<'Completed' | 'In Progress' | 'Not Started'>('In Progress')

  const [sortBy, setSortBy] =
    useState<'Completion' | 'Score'>('Completion')

  const [selectedElement, setSelectedElement] = useState('')

  
  //Fetch function
  const fetchResults = async (retryCount = 0) => {
    if (!instanceId) return
  
    setLoading(true)
    setError(null)
  
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8002'}/api/assessment/results/${instanceId}`
      )
  
      setResults(response.data)
    } catch (err: any) {
      const isNetworkError = !err.response
      const status=err.response?.status
  
      // Auto retry for network errors (max 2 times)
      if (isNetworkError && retryCount < 2) {
        setTimeout(() => {
          fetchResults(retryCount + 1)
        }, 1500)
        return
      }

      if (status === 500) {
        setError({
          type: 'not-found',
          message: 'Assessment not found. The instance ID may be incorrect.'
        })


      }else{
        setError({
          type: 'generic',
          message: 'Something went wrong.'
        })

      }
  
      
    } finally {
      setLoading(false)
    }
  }

  //useEffect to fetch it
  useEffect(() => {
    fetchResults()
  }, [instanceId])

  //Using first element score by default

  const firstElementKey = useMemo(() => {
    if (!results?.element_scores) return ''
  
    const keys = Object.keys(results.element_scores)
    return keys.length > 0 ? keys[0] : ''
  }, [results])

  const activeElement = selectedElement || firstElementKey

  //Element level data transformation, filtering and sorting

  const processedElements = useMemo(() => {
    if (!results?.element_scores) return []

    let elements = Object.values(results.element_scores).map(el => ({
      ...el,
      status: getStatus(el.completion_percentage ?? 0)
    }))

    elements = elements.filter(el => el.status === statusFilter)

    if (sortBy === 'Completion') {
      elements.sort(
        (a, b) =>
          (b.completion_percentage ?? 0) -
          (a.completion_percentage ?? 0)
      )
    }

    if (sortBy === 'Score') {
      elements.sort(
        (a, b) =>
          (b.scores?.percentage ?? 0) -
          (a.scores?.percentage ?? 0)
      )
    }

    return elements
  }, [results, statusFilter, sortBy])


  
    

  
    
 
  const derivedResult = useMemo(() => {
    if (!results?.element_scores || !activeElement) return null
  
    const element = results.element_scores[activeElement]
    if (!element) return null
  
    const questions = element.question_answers
  
    const scorePerQuestion = questions.map(q => {
      const isAttempted = q.is_answered ?? false
  
      if (q.is_reflection) {
        return {
          name: `R${q.question_sequence}`,
          score: 0,
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
      element,
      filteredQuestions: questions,
      scorePerQuestion
    }
  }, [results, activeElement])

  if (loading) {
    return <div className="loading">Loading results...</div>
  }

  if (error) {
    return (
      <div className={`error-state ${error.type}`}>
        <h3>Error</h3>
        <p>{error.message}</p>
  
        {error.type !== 'not-found' && (
          <button onClick={() => fetchResults()}>
            Retry
          </button>
        )}
      </div>
    )
  }
  if (!results) {
    return <div className="empty">No results to display</div>
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
      {/* Element level control */}
      <AssessmentControls
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          activeElement={activeElement}
          setSelectedElement={setSelectedElement}
          processedElements={processedElements}
      />

      {/* Bar Chart */}

      {derivedResult && (
       <ScoreChart data={derivedResult.scorePerQuestion} />
      )}


       {/* Question Breakdown Component */}

       {derivedResult && (<div className="card">
        <h3>Question Breakdown</h3>
        {derivedResult.filteredQuestions.length === 0 && <div className="empty">No questions match filter.</div>}
        {derivedResult.filteredQuestions.map(q => (
          <QuestionItem key={q.question_id} question={q} onClick={() => setSelectedQuestion(q)} />
        ))}
      </div>)}

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
