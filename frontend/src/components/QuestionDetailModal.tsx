import React from 'react'
import { QuestionAnswer } from './AssessmentResults'


interface QuestionDetailModalProps {
  question: QuestionAnswer
  onClose: () => void
}

const QuestionDetailModal = ({ question, onClose }: QuestionDetailModalProps) => {
  const isReflection = question.is_reflection
  const isAnswered = isReflection
    ? !!question.text_answer?.trim()
    : question.is_answered

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {isReflection ? 'Reflection Question' : `Question ${question.question_sequence}`}
        </h2>

        <p className="question-text">
          {isReflection ? question.reflection_prompt : question.question_title}
        </p>

        <div className="question-info">
          <p>
            <strong>Status:</strong>{' '}
            <span className={isAnswered ? 'green' : 'red'}>
              {isAnswered ? 'Answered' : 'Unanswered'}
            </span>
          </p>

          {isReflection && isAnswered && (
            <p className="reflection-answer">
              <strong>Your Reflection:</strong><br />
              {question.text_answer}
            </p>
          )}

          {!isReflection && (
            <>
              <p><strong>Score:</strong> {question.answer_value ?? '-'}</p>
              <p><strong>Max Score:</strong> {question.max_score ?? '-'}</p>
              {question.option_number != null && (
                <p><strong>Selected Option:</strong> {question.option_number}</p>
              )}
              {question.answer_text && (
                <p><strong>Answer Text:</strong> {question.answer_text}</p>
              )}
            </>
          )}
        </div>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default QuestionDetailModal