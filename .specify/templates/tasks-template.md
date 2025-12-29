# Tasks: {FEATURE_NAME}

> Actionable task breakdown for implementation.
> Tasks sync to GitHub issues for tracking.

---

## Format

Each task follows: `[ID] [Story] Description`

- **ID**: Unique task identifier (T001, T002, etc.)
- **Story**: Reference to user story from spec (US1, US2, etc.)
- **Description**: Clear, actionable task description

---

## Wave 1: {Wave Description}

- [ ] **T001** [US1] {Task description - what needs to be done}
- [ ] **T002** [US1] {Task description}
- [ ] **T003** [US2] {Task description}

## Wave 2: {Wave Description}

- [ ] **T004** [US2] {Task description}
- [ ] **T005** [US3] {Task description}

## Wave 3: {Wave Description}

- [ ] **T006** [US3] {Task description}
- [ ] **T007** [--] {Infrastructure/testing task not tied to user story}

---

## Issue Sync Status

Use `/spec:sync {feature-name}` to create GitHub issues from waves.

| Wave | Issue | Status |
|------|-------|--------|
| Wave 1 | #TBD | Not synced |
| Wave 2 | #TBD | Not synced |
| Wave 3 | #TBD | Not synced |

---

## Notes

- Each wave becomes a GitHub issue
- Tasks within wave become issue checklist
- Update table after running `/spec:sync`
- Mark tasks complete as work progresses

---

*Tasks implement [spec.md](spec.md)*
