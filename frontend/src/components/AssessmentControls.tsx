import React from 'react'
import { ElementScore } from './AssessmentResults'

interface Props {
  statusFilter: 'Completed' | 'In Progress' | 'Not Started'
  setStatusFilter: React.Dispatch<
    React.SetStateAction<'Completed' | 'In Progress' | 'Not Started'>
  >
  sortBy: 'Completion' | 'Score'
  setSortBy: React.Dispatch<
    React.SetStateAction<'Completion' | 'Score'>
  >
  activeElement: string
  setSelectedElement: React.Dispatch<React.SetStateAction<string>>
  processedElements: ElementScore[]
}

const AssessmentControls = ({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  activeElement,
  setSelectedElement,
  processedElements
}: Props) => {
  return (
    <div className="assessment-controls">

      <div className="control-block">
        <label>Status</label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as
                | 'Completed'
                | 'In Progress'
                | 'Not Started'
            )
          }
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Not Started">Not Started</option>
        </select>
      </div>

      <div className="control-block">
        <label>Sort By</label>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'Completion' | 'Score')
          }
        >
          <option value="Completion">Completion</option>
          <option value="Score">Score</option>
        </select>
      </div>

      <div className="control-block">
        <label>Element</label>
        <select
          value={activeElement}
          onChange={(e) => setSelectedElement(e.target.value)}
        >
          {processedElements.length === 0 && (
            <option value="">No Elements</option>
          )}

          {processedElements.map(el => (
            <option key={el.element} value={el.element}>
              Element {el.element}
            </option>
          ))}
        </select>
      </div>

    </div>
  )
}

export default AssessmentControls