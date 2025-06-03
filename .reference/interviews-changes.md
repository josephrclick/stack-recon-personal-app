Here is a **Work Order** for your coding assistant to revamp the `ApplicationsClient` page using a Kanban-based layout and UI enhancements, while building on your current architecture and Tailwind-based design.

---

## 🛠️ **Work Order: Kanban-Based Application Tracker Redesign**

### 🎯 Objective

Revamp the `ApplicationsClient` UI from a table list to a **Kanban board layout**, enabling drag-and-drop between stages, inline AI insights, and improved strategic visualization.

---

### ✅ **Key Features To Implement**

#### 1. **Kanban Columns with Drag & Drop**

* Replace the left-side table with a horizontally scrollable Kanban board.
* Each column represents a status:

  * `Applied`
  * `Recruiter Screen`
  * `Hiring Manager`
  * `Awaiting Offer`
* Use libraries like `@dnd-kit/core` or `react-beautiful-dnd` for drag-and-drop support.
* Dragging a card updates `application_status` in Supabase.

#### 2. **Job Cards UI Enhancements**

* Display:

  * `company_name`, `job_title`
  * `ai_status_score` as a colored badge or radial meter
  * Short `ai_tailored_summary` (1–2 lines max)
* Add icons or tooltips if there are:

  * `red_flags`
  * `strategy_notes`
  * `ai_resume_tips`
* Optional: Add small “last updated” timestamp at the bottom of the card.

#### 3. **Click-to-Expand Drawer / Panel**

* Clicking a card opens a right-side panel (keep your existing right panel structure).
* Integrate:

  * Interview timeline (current)
  * Contact info (current)
  * Notes (current)
  * Add **"Interview Angle"** and **"Strategic Leverage"** to the top of the panel.

#### 4. **Add Filter/Sort Menu (Optional)**

* Allow filtering across all boards by:

  * Score range
  * Job title or company
* Add toggles for:

  * Show archived
  * Show only “active interview”

---

### 🧩 Integration Guidelines

#### ✏️ Database Alignment

* Map new board stages to current `application_status` values.
* Suggested value mappings:

  ```ts
  const KANBAN_STATUSES = {
    'Applied': 'applied',
    'Recruiter Screen': 'recruiter_call',
    'Hiring Manager': 'hiring_manager',
    'Awaiting Offer': 'offer'
  };
  ```

#### 📦 Data Load

* Reuse `useQuery<Job[]>` to load jobs grouped by `application_status`.
* Convert list of jobs into columns for Kanban rendering.

#### ♻️ Mutation

* Use existing `updateStageMutation` to update status on drag-and-drop.

---

### ✨ Component Sketches

#### 📌 Column

```tsx
<KanbanColumn title="Applied" jobs={jobs['applied']} />
```

#### 📌 Card

```tsx
<JobCard
  job={job}
  onClick={() => setSelectedJob(job)}
/>
```

#### 🧩 Drag Logic

Use:

```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={jobs}>
    {/* Render columns + cards */}
  </SortableContext>
</DndContext>
```

---

### 🔧 Suggested File Breakdown

| File                          | Purpose                  |
| ----------------------------- | ------------------------ |
| `components/KanbanBoard.tsx`  | Overall board and layout |
| `components/KanbanColumn.tsx` | Individual columns       |
| `components/JobCard.tsx`      | Card for job UI          |
| `hooks/useDragDrop.ts`        | Drag logic and mutations |

---

### 🧠 Strategic Extras (Optional, stretch goals)

* Highlight cards that haven't been updated in X days.
* Add a “Priority” tag based on `ai_status_score` or `strategic_leverage`.
* Timeline view toggle to show interviews scheduled across jobs.

---

Would you like me to scaffold this in actual code files next?
