import React from "react";
import { QuestionAnswer } from "./AssessmentResults";


interface QuestionItemProps {
  question: QuestionAnswer;
  onClick: () => void;
}

const QuestionItem = ({ question, onClick }: QuestionItemProps) => {
  const isReflection = question.is_reflection;

  const isAnswered = isReflection
    ? !!question.text_answer?.trim()
    : question.is_answered;

  return (
    <div
      className={`question-card ${
        isAnswered ? "answered" : "unanswered"
      }`}
      onClick={onClick}
    >
      <div className="left-indicator" />

      <div className="question-content">
        <div className="question-header">
          <h4 className="question-title">
            {isReflection
              ? "Reflection Question"
              : `Question ${question.question_sequence}`}
          </h4>

          <span
            className={`status-badge ${
              isAnswered ? "success" : "danger"
            }`}
          >
            {isAnswered ? "Answered" : "Unanswered"}
          </span>
        </div>

        <p className="question-text">
          {isReflection
            ? question.reflection_prompt
            : question.question_title}
        </p>

      
        {!isReflection && (
          <div className="score-section">
            <span className="score">
              {question.answer_value ?? "-"} /{" "}
              {question.max_score ?? "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionItem;