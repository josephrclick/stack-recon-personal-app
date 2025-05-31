---

## 🧠 Overall Page Concept: `Applications Dashboard`

This is your command center for managing everything post-application. Think of it as your **deal pipeline UI**, but for interviews.

---

## 🔲 Top-Level View: "Active Applications List"

### 🎯 Purpose:

Quickly scan all open applications to see which ones are hot, stale, or ready for a next move.

### 🧩 Display per row (job application):

| Field               | Display Notes                                       |
| ------------------- | --------------------------------------------------- |
| ✅ Company           | Logo + name                                         |
| 🧑‍💼 Job Title     | Title as link                                       |
| 💵 Salary Range     | `$110–130k` or `–`                                  |
| 📅 Applied Date     | `Mar 22, 2025`                                      |
| 🕑 Last Activity    | `Recruiter screen – Apr 3`                          |
| 📌 Current Stage    | Pill badge: `Screening`, `Interview`, `Offer`, etc. |
| 🧾 Notes Preview    | Truncated 1-line log e.g. `"Need to follow up"`     |
| ☑️ Action Shortcuts | “Mark Stage”, “Add Note”, “View” buttons            |

### 🔍 Filters (top of list):

* Stage (dropdown): `All`, `Screening`, `Interview`, `Offer`, `Rejected`
* Sort by: `Last Update`, `Applied`, `Company`

---

## 🔎 Detailed View: "Expanded Application Card"

Opens when a job is selected — either side-panel (like current StackRecon) or full-page modal.

### 🗂️ Application Details Section:

| Field              | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| Company Info       | Logo, site, industry, notes                                 |
| Role Info          | Job title, level, salary, location, job link                |
| Application Status | ENUM stage selector: `applied`, `screen`, `technical`, etc. |
| Applied On         | Date                                                        |
| Last Updated       | Timestamp                                                   |
| Contact Info       | Recruiter + hiring manager name/email                       |

---

### 📆 Interview Timeline Section:

| Subsection               | Display                       |
| ------------------------ | ----------------------------- |
| Recruiter Screen         | Date + notes                  |
| Hiring Manager Interview | Date + notes                  |
| Panel / Final Round      | Date + interviewer names      |
| Offer Details            | Status + offer JSON unpacked  |
| Next Step                | Text field + `Follow-Up Date` |

---

### 📓 Notes Section:

* Full-text log, markdown optional
* Timestamped
* “Add note” CTA with dropdown: `update`, `feedback`, `decision`, etc.

---

### 🛠 Actions (sticky or floating):

* “Mark Next Stage”
* “Generate Interview Questions”
* “Add Note”
* “Download Timeline”
* “Archive Application”

---

## 🖼 Mock Layout (Hierarchy)

```
|------------------------------------------------------------|
| Applications Dashboard                                     |
|------------------------------------------------------------|
| 🔍 Filters              [Stage: All]  [Sort: Last Update]   |
|                                                            |
| ▢ Company | Title | Stage | Applied | Last Update | Action |
|------------------------------------------------------------|
| ▶ Acme Inc. | SE | Technical | Mar 1 | Apr 5 | View ⏵      |
| ▶ ZoomInfo  | SC | Offer     | Mar 12| Apr 7 | View ⏵      |
|------------------------------------------------------------|

Sidebar or Modal (on click View):
|------------------------------------------------------------|
| ZoomInfo – Solutions Consultant                            |
|------------------------------------------------------------|
| 📄 Job Info      | 💬 Contacts | 📅 Timeline | 📝 Notes      |
|------------------------------------------------------------|
| 🔘 Stage: Offer  | Applied: Mar 12  | Updated: Apr 7       |
| Recruiter: Kim S (kim@)                                     |
| Manager: Sam G (sam@)                                      |
|                                                            |
| ✅ Recruiter Call: Mar 14 – "Went well"                    |
| ✅ Tech Screen: Mar 21 – "They asked X"                    |
| ⏳ Panel Interview: Apr 8 @ 10am                           |
| Offer: TBD                                                 |
| Next Step: Send thank-you note                             |
| Follow-Up: Apr 9                                           |
|                                                            |
| [Add Note] [Advance Stage] [Download Summary]             |
|------------------------------------------------------------|
```

---

## 📌 Key UX Priorities

* **Speed**: Click to expand, don’t navigate away
* **Clarity**: Timeline order, actionables up front
* **Persistence**: Every note, contact, or event tracked with timestamps
* **Flexibility**: Optional fields won’t clutter UI if empty
* **Ownership**: You feel like you’re *running a deal desk*, not just watching statuses change

---

## 🌲 `ApplicationsDashboard` Component Tree

```
ApplicationsDashboardPage
├── Header (breadcrumb + filters + search)
│   ├── StageFilterDropdown
│   ├── SortSelector
│   └── SearchInput (optional)
│
├── ApplicationListTable
│   ├── ApplicationListRow (xN)
│   │   ├── CompanyNameWithLogo
│   │   ├── JobTitle
│   │   ├── ApplicationStagePill
│   │   ├── DateApplied
│   │   ├── LastUpdated
│   │   └── ViewDetailsButton
│   └── EmptyState / LoadingPlaceholder
│
├── ApplicationDetailsPanel (on row select)
│   ├── ApplicationSummaryHeader
│   │   ├── CompanyName + JobTitle
│   │   └── StageSelector (dropdown or segmented control)
│   ├── ContactInfoCard
│   │   ├── RecruiterContact (name, email, interview date)
│   │   └── ManagerContact (name, email, interview date)
│   ├── InterviewTimelineCard
│   │   ├── RecruiterScreenEvent
│   │   ├── TechnicalInterviewEvent
│   │   ├── PanelInterviewEvent
│   │   ├── OfferDetailsCard (if present)
│   │   └── NextStep + FollowUpDate
│   ├── NotesSection
│   │   ├── NotesList
│   │   └── AddNoteForm
│   └── ActionToolbar
│       ├── AdvanceStageButton
│       ├── DownloadTimelineButton
│       └── ArchiveButton
```

---

## 🔧 Design Notes

* **Modularity**: Each card/component can be reused in future views (e.g. `/Interviews`, `/Archived`)
* **Collapsibility**: Sections like “OfferDetails” or “Notes” can be toggled open/closed
* **Sticky Actions**: `ActionToolbar` should stay in view as you scroll inside the details panel
* **Visual Cues**: Use badge colors, date formatting, and subtle dividers for fast scanning

---

## 🔄 Suggested State Management

| Component        | State Source                                         |
| ---------------- | ---------------------------------------------------- |
| Filter + Sort    | Local `useState` or URL params                       |
| Job List         | `useQuery(['applications'])` with stage/sort filters |
| Selected Job     | `useState<jobId>` or global context                  |
| Notes + Timeline | Nested query or normalized with selected job         |

---
