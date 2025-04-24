# Sprint Planning Document – Interview Tracker Sprint

---

## 🗓️ Sprint Info

- **Sprint Title:** StackRecon Interview Tracker MVP
- **Start Date:** 2025-04-23
- **Target End Date:** TBD
- **Status:** In Progress

---

## 🎯 Objectives

- [X] Build /interviews dashboard UI with two-pane layout
- [X] Implement manual tracking of past and future interview stages
- [ ] Integrate GPT v3.1 prompt to generate prep from job + notes
- [ ] Lay foundation for future automation (calendar, email, insight chaining)

---

## 👥 Assistant Roles Active This Sprint

- **Project Manager (default):** Coordination, progress logging, template updates
- **Coder (assisted in Cursor IDE):** Frontend iteration, component design, task control
- **Researcher (on call):** Support for strategic insight prompts

---

## 🛠️ Deliverables

- [X] `/app/protected/interviews` page UI with live job data
- [X] Stage editor (manual input for name, date, notes)
- [ ] Button to trigger GPT interview prep output
- [X] Update to job record schema if needed

---

## 🧠 Known Dependencies / Open Questions

- Should stage events be modeled as nested records or embedded JSON?
    - updated DB to hold an array of stage objects
- Do we enable PDF download for prep sheet or just copyable text?

---

## 📝 Notes & Context

UI screenshots, file paths, and current page logic saved to project file archive. Coding in Cursor, Thought OS will track high-level structure and output.
