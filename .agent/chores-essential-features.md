# Chore Management Module — Essential Features & User Flows

This document details all essential features, user flows, business logic, and API interactions for the **Chore Management** module in the **RoomMate** application.

It is structured in accordance with [household-design-philosophy.md](file:///Users/souravseal/RoomMate/.agent/household-design-philosophy.md), emphasizing the Gen-Z/Millennial target demographic (18–35), frictionless 1-tap interactions, visual whiteboard aesthetics, and accountability without roommate drama.

---

## 1. Feature Matrix & Capabilities

### 1.1 Tactile Whiteboard Chore Board
- **Glanceable Status Columns / Sections**:
  - **Due Today**: High-urgency tasks highlighted with warm terracotta accent rings.
  - **Upcoming This Week**: Scheduled future tasks with countdown chips (*"In 2 days"*).
  - **Completed / Done**: Faded tactile cards with strike-through text and completion timestamps.
  - **Overdue Alert**: Distinct amber alert banner for tasks past their due date.
- **1-Tap Quick Filters**: Instant toggle chips (*"My Chores 👤"*, *"All Flatmates 👥"*, *"Due Today ⏰"*, *"High Priority 🔥"*).

### 1.2 Effortless Chore Creation (Lazy-Friendly)
- **Preset Quick-Task Chips**: 1-click popular task chips (*"Take Out Trash 🗑️"*, *"Wash Dishes 🍽️"*, *"Clean Kitchen 🧼"*, *"Vacuum Living Room 🧹"*, *"Wipe Counters ✨"*) to minimize typing.
- **Smart Assignment**:
  - Assign to any roommate with 1-click avatar selector.
  - Leave unassigned / "First Come, First Served" pool.
  - Creator auto-assignment option.
- **Frequency Automation**: Set recurring cadences (`DAILY`, `WEEKLY`, `BIWEEKLY`, `MONTHLY`, `ONCE`) with automated next due date scheduling.
- **Priority Indicator**: Visual urgency badges (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).

### 1.3 1-Tap Completion & Rescheduling
- **1-Tap Checkbox Toggle**: Directly marks tasks as completed with celebratory micro-animations (spring checkmark, subtle haptic/confetti).
- **Quick Reschedule Date Picker**: 1-click reschedule buttons (*"Postpone to Tomorrow"*, *"Next Week"*).
- **Chore Deletion**: Instant swipe/menu action to remove obsolete tasks.

---

## 2. End-to-End User Flows

### Flow 1: 1-Tap Chore Completion & Auto-Recurrence
1. **Trigger**: User completes a task (e.g., *"Empty Dishwasher"*) and taps the circular checkbox on the chore card.
2. **Client Action**: Optimistically animates checkbox tick and plays celebration feedback.
3. **API Request**: `POST /chore/update/:choreId` with `{ completed: true }`.
4. **Server Logic**:
   - Updates chore completion status in database.
   - If chore has a recurring frequency (e.g. `WEEKLY`), automatically calculates the `nextDue` date using cadence utility (`getNextDueDate`) and queues next cycle.
5. **Resolution**: Card moves into the "Completed" section with toast: *"Awesome! 'Empty Dishwasher' completed 🎉"*.

---

### Flow 2: Rapid Chore Creation (Under 5 Seconds)
1. **Trigger**: User clicks "+ New Chore".
2. **Form Interaction**:
   - User taps a quick-preset chip (*"Take Out Trash"*) -> Title is filled automatically.
   - User taps roommate avatar (e.g., *Alex*) -> Assigned to Alex.
   - Frequency defaults to `WEEKLY` and next due defaults to `Today`.
3. **API Request**: `POST /chore/add` with `{ description, frequency, nextDue, householdId, assignedToId, priority, notes }`.
4. **Server Logic**: Validates household membership and creates `Chore` record linked to the household and assigned user.
5. **Resolution**: Closes modal immediately, inserts card into the board, and logs activity in household feed.

---

### Flow 3: Filtering Chores ("What do I need to do?")
1. **Trigger**: User opens `/chores` looking only for their personal responsibilities.
2. **Interaction**: User taps the **"My Chores"** filter pill.
3. **UI Action**: Instantly filters list to chores where `assignedToId === currentUser.userId`, highlighting tasks due today.

---

### Flow 4: Rescheduling a Chore (Zero Guilt Postpone)
1. **Trigger**: User cannot complete a task today and clicks "Reschedule".
2. **Interaction**: Clicks quick chip *"Tomorrow"* or selects a new date from the lightweight calendar.
3. **API Request**: `POST /chore/update/:choreId` with `{ choreId, nextDue: newDate }`.
4. **Resolution**: Card updates its due date chip and shifts smoothly into the upcoming section.

---

### Flow 5: Deleting a Chore
1. **Trigger**: Chore is no longer relevant (e.g., guest room task).
2. **Interaction**: User opens card menu -> clicks "Delete Chore".
3. **API Request**: `DELETE /chore/:choreId`.
4. **Resolution**: Card removes with smooth exit animation and confirmation toast.

---

## 3. Backend API Endpoints & Data Contracts

| Operation | HTTP Method & Route | Request Data | Response Data |
| :--- | :--- | :--- | :--- |
| **Fetch Household Chores** | `GET /chore/household/:householdId` | URL param: `householdId` | `{ data: ChoreWithUser[] }` |
| **Create Chore** | `POST /chore/add` | `{ description: string, frequency: string, nextDue: Date, householdId: string, assignedToId?: string, priority?: string, notes?: string }` | `{ data: ChoreResponse }` |
| **Update / Complete Chore** | `POST /chore/update/:choreId` | `{ choreId: string, completed?: boolean, nextDue?: Date, description?: string, assignedToId?: string }` | `{ data: ChoreResponse }` |
| **Delete Chore** | `DELETE /chore/:choreId` | URL param: `choreId` | `{ data: null, message: "Chore Deleted" }` |
