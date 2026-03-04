# Solution - Praharsh Pranjal

## Phase 1 Deliverables 

### Wireframe Diagram

![Alt text](Dashboard_Wireframe.png)

### Visualization Bar Chart
![Alt text](Bar_Chart.png)


### Component Hierarchy
![Alt text](Component_.Hierarchy.png)

Note:
In the actual project, I used a slightly different hierarchy because some components were already built. The above structure shows the ideal case if everything were built from scratch.

### Data transformation

![Alt text](Data_Transformation.png)

## Task Completed
[Frontend]

## Time Spent
3 hours of Coding(Phase 2 + Phase 3)
1 hour in writing the solution 
30 mins for wireframing


---

## Approach
The overall approach is to design a dashboard that is clear, modular, and scalable and give the visual idea at first glance rather than making it complex. The focus is on creating a clean user flow where users can start from a high-level summary and progressively drill down into detailed information like questions breakdown etc.

I structured the dashboard around three core layers:

1. Summary Level – Overall completion and score metrics.

2. Element Level – Performance breakdown per selected element.

3. Question Level – Individual question performance and detailed view.

Each structures is not overwhelmed with data but showing the key elements and visual graphics.

From a technical perspective, I followed a component-based architecture using React and applied separation of concerns. Each component has a single responsibility, and data flows downward via props(specific to each component). 
Derived metrics such as completion percentages, chart data, and answered/unanswered counts are calculated efficiently using memoization to avoid unnecessary re-renders.

Error handling and edge cases are considered and also missing data is handled gracefully from the begining of the project.
The approach included structured error states, retry logic for network failures, and safe rendering guards to prevent runtime crashes.

Coming to state handling , as data is not that big and diverse and not many state is changing , we keep it simple and uses "useState" hooks.

At last, the goal was not just to display data, but to create a reliable, understandable, and extensible analytics interface.

## Implementation Details

### 1.1 Use of Component Structure

The dashboard is organized into modular components:

- AssessmentResults – Main container responsible for data fetching, state management, and coordinating child components.
- AssessmentControls – Handles element selection, sorting, and status filtering.
- ScoreChart – Renders question-level scores using a bar chart.
- QuestionItem & QuestionDetailModal – Displays question breakdown and detailed drill-down view.

Key decision : Using SOLID principles and Separation of concerns. This structure ensures maintainability and scalability as features grow and helps to debug fast. Other components are not touched like KPI summary but that can also be made into components if I had time.

### 1.2 Data handling and Transformation:

Data is fetched from the API using Axios. A retry mechanism is implemented for network failures to improve resilience with proper error catch and retry button.

For transformation of data, please consider the given Data Transformation Diagram 
Raw API data is not passed directly to visual components. Instead:

- Element data is normalized.
- Filtering and sorting are applied at the element level.
- Question-level data is transformed into a chart-friendly format.
- Derived metrics are calculated using useMemo.


Key Decision : How to represent data in form of chart which will be discussed in Section 1.3. Data transformation at 2 level (element and question) gives us flexibility that we can select different given element and questions are shown according to selection. Handling missing data by guarding against undefined data and handle empty elements andunanswered question . 


const isAttempted = q.is_answered ?? false
const score = isAttempted ? q.answer_value ?? 0 : 0

Or by using safe fallback value
el.scores?.percentage ?? 0 ->Prevent NaN or undefined data

Error handling if instance ID is invalid or API fails , a structured error is shown

### 1.3 Visualizations

A bar chart was chosen to represent question-level performance because it clearly shows comparison between individual questions.
- Each bar represents one question and is color-coded to indicate performance level. Reflection questions are handled separately to avoid misleading score interpretation.
- The chart was implemented using Recharts due to its flexibility, responsiveness, and ease of integration with React.

Future ideas:
Later, we might add radar charts for element-based scores or a gauge for the overall percentage. These would give a quick overview, but for now, the bar chart is the best choice to show question-level performance clearly.

### 1.4 UX Implemented


- Automatic selection of the first available element.
- Clear empty states when no data is available.
- Structured error states for invalid instance IDs.
- Retry button for recoverable errors.
- Color coded score indicators.
- Drill-down modal for detailed question analysis.

These decisions were made to ensure the dashboard feels intuitive and robust rather than purely functional.

## Tools & Libraries Used


1. Recharts – used for bar charts because it’s simple, responsive, and well-documented. StackOverflow was helpful for tricky chart layouts.

2. CSS / Styling – currently CSS Modules are used for consistent, production-ready styling. In the future, Tailwind CSS will be introduced to improve responsiveness even further and make toggling between light and dark themes easier.

3. useMemo & useEffect – for efficiently calculating derived data and keeping the UI reactive without unnecessary re-renders.

4. AI / Support Tools – ChatGPT was only used to discuss CSS ideas and test edge-case scenarios, helping make development more efficient. No code was generated by AI, all logic was carefully thought through and written manually. StackOverflow and GitHub examples were also consulted for charts and best practices.

5. VS Code – Primary development environment with strong TypeScript and linting support.

6. React.lazy & Suspense – Enabled lazy loading of the chart component to optimize initial load performance.

## Testing

### Functional Testing

I manually tested all core user flows:

- Loading the dashboard with a valid instanceId and invalid Instance Id
- Switching between different elements (with dummy data)
- Applying status filters (Completed / In Progress / Not Started)
- Sorting by Completion and Score
- Opening and closing the question detail modal
- Verifying chart updates when element changes

Each action was tested to ensure that the UI updates correctly, no console errors occur and no stale data is displayed

### Error & Retry Testing

I tested the following:
- Invalid instanceId
- Network disconnection

Verified that structured error message appears, retry button works correctly.

## Challenges & Solution

1. Managing Derived Data Complexity
Challenge:
Filtering, sorting, and element selection logic could easily conflict as if no elemet_score is selected or we have multiple element_score , leading to incorrect chart rendering or stale state.

Solution:
I made a flow with very first element_score is automatic selected if present otherwise fallback value, flow is like

Raw API data
Processed element-level data
Derived question-level chart data

Using useMemo ensured transformations were recalculated only when dependencies changed.


2. Handling Reflection Questions
Challenge:
Reflection questions have no numeric score but still need representation in the UI.

Solution:
I marked them with a specific type and excluded them from score calculations while still displaying them in the chart for contextual completeness.

3. Error Handling & Retry Logic
Challenge:
Initial implementation treated all errors the same.

Solution:
Implemented structured error handling with:
Differentiation between invalid ID and generic error
Retry logic for recoverable cases
Clear error state UI


## Future Improvements

- Add automated testing (Jest + React Testing Library).
- Introduce radar or comparison charts for element-level analytics.
- Add historical performance tracking (trend charts).
- Implement light/dark theme toggle.
- Improve accessibility (ARIA labels, keyboard navigation).
- Add caching for API responses.
- Introducing tailwind or UI Components like MaterialUI

## Final Summary 
The dashboard was built with focus on clarity and scalability. Challenges were primarily around data transformation, type safety and error handling.

The current implementation is production ready , however , the scope for improvement is very wide but restricted due to given timeline.