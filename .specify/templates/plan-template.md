# Implementation Plan: {FEATURE_NAME}

## Summary

{1-2 paragraph overview of the technical approach and architecture decisions}

## Architecture

### Components

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| {Component 1} | {What it does} | {Tech used} |
| {Component 2} | {What it does} | {Tech used} |

### Data Flow

```
{ASCII diagram or description of how data flows through the system}
User → Component A → Component B → Database
```

### File Structure

```
src/
├── components/
│   └── {feature}/
│       ├── ComponentName.tsx
│       └── ComponentName.test.tsx
├── api/
│   └── {feature}/
│       └── route.ts
└── lib/
    └── {feature}/
        └── utils.ts
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| {package-name} | ^x.y.z | {Why we need it} |

## Implementation Phases

### Phase 1: {Phase Name}
**Goal:** {What this phase achieves}

**Tasks:**
- [ ] {Task 1}
- [ ] {Task 2}

**Dependencies:** None

### Phase 2: {Phase Name}
**Goal:** {What this phase achieves}

**Tasks:**
- [ ] {Task 1}
- [ ] {Task 2}

**Dependencies:** Phase 1 complete

## Testing Strategy

- **Unit Tests:** {What will be unit tested}
- **Integration Tests:** {What will be integration tested}
- **E2E Tests:** {What will be E2E tested}

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| {Potential issue} | {High/Med/Low} | {How we'll handle it} |

## Performance Considerations

- {Performance requirement 1}
- {Performance requirement 2}

---

*Plan aligns with [spec.md](spec.md) and [constitution.md](../memory/constitution.md)*
