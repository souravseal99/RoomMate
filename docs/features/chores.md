# Chore Management

## Overview
The Chores module ensures household accountability by tracking recurring and one-off tasks.

## Workflow
1. **Assignment**: A household member creates a chore, defining its frequency (e.g., Daily, Weekly) and priority (Low, Medium, High).
2. **Delegation**: The chore can be assigned to a specific user or left unassigned for anyone to pick up.
3. **Completion**: Once a task is finished, the assigned user marks it as `completed`.
4. **Reset**: For recurring chores, the system logic calculates the `nextDue` date based on the frequency upon completion.

## User Interaction
- **Dashboard View**: Users see their personally assigned chores on the main dashboard as high-priority "To-Do" items.
- **Household View**: A master list shows all chores, their current status, and who is responsible.
- **Status Toggle**: A simple checkbox or toggle sends a `PATCH` request to update the record in real-time.

## UI Components
- **`ChoreCard`**: Displays chore details, urgency indicators, and completion actions.
- **`ChoreForm`**: A modal for creating or editing tasks.
