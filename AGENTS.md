## Interaction

- Clarify unclear requests, then proceed autonomously. Always ask if there is anything unclear
- **NEVER implement multi-step plans in one go** - break down work into checkpoints and ask for user confirmation before proceeding to the next step
- After completing each logical step or group of related changes, pause and ask: "Should I continue with the next step?"
- Let the user review work incrementally, especially for complex tasks with multiple phases

## Ground Truth Clarification

- For non-trivial tasks, reach ground truth understanding before coding.
- Simple tasks execute immediately.
- Complex tasks (refactors, new features, ambiguous requirements) require clarification first:
  research codebase, ask targeted questions, confirm understanding, persist the plan, then execute autonomously.

---

## Learning Philosophy

### "Learn the Problem Before Learning the Solution"

This is a **learning-first project**, not a rush-to-production project. The goal is deep understanding, not just fast delivery.

**Core Principle:**

- Experience problems firsthand → Understand why solutions exist → Appreciate the value of tools

**Phase 1 Approach (Manual Implementations):**

- Use `useState` + `useEffect` for data fetching (no TanStack Query)
- Experience prop drilling before introducing Context API
- Implement optimistic updates manually (understand the complexity)
- Manual cache invalidation (feel the pain of refetching)
- Manual form handling and validation

**Phase 2 Approach (Introduce Better Tools):**

- After experiencing problems, introduce TanStack Query, React Hook Form, etc.
- Compare before/after code and document improvements
- Understand **why** these tools exist and **when** to use them

**What This Means for Implementation:**

- ✅ Accept temporary "bad practices" in Phase 1 (prop drilling, manual refetching)
- ✅ Resist urge to prematurely optimize with libraries
- ✅ Document pain points encountered during Phase 1
- ✅ Don't suggest "better ways" during Phase 1 - let the user experience the problems
- ❌ Don't say "TanStack Query would solve this" during Phase 1 implementation
- ❌ Don't introduce abstractions early "to save time"

**Exceptions (Use Best Practices from Start):**

- ✅ Styling: shadcn/ui, Tailwind CSS (not core to React learning)
- ✅ Backend: Drizzle ORM, Zod validation (not React-specific)
- ✅ Code quality: ESLint, Prettier, TypeScript strict mode

📄 **Reference:** [docs/adr/003-manual-state-management-before-abstractions.md](./docs/adr/003-manual-state-management-before-abstractions.md)

---

## Development Workflow

- Follow Trunk-Based Development (TBD)
- Create feature branches from main: `<type>/<description>`
- One vertical slice per PR (backend + frontend + tests)
- Commit frequently with conventional commit messages
- Merge to main only after CI passes
- Fix forward, not revert (unless main is critically broken)
- **User creates PRs manually** - DO NOT automate PR creation with gh CLI or similar tools
- After pushing commits, provide a summary and let the user create the PR themselves

---

## Implementation Approach

- Implement vertical slices (full-stack features, not horizontal layers)
- Each slice must include:
  - Backend implementation (routes, validation, tests)
  - Shared types (packages/shared)
  - Frontend implementation (UI, state management)
  - Tests (backend integration tests minimum)
- Incomplete features are acceptable if they don't break existing functionality
- No feature flags required for Phase 1

## Change Size

- Make focused, complete changes per vertical slice
- One PR should deliver one working feature end-to-end
- Avoid half-implemented features split across multiple PRs
- Balance between "too small" (many trivial PRs) and "too large" (week-long branches)

---

## Code Quality Standards

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig.json)
- No `any` types - use `unknown` or proper typing
- Prefer interfaces for object shapes, types for unions/intersections
- Use `const` by default, `let` only when mutation is needed
- Explicit return types for exported functions

### Error Handling

- Backend: Use proper HTTP status codes (200, 201, 400, 404, 500)
- Frontend: Display user-friendly error messages
- Always handle promise rejections
- Log errors with context (what failed, why, where)

### Naming Conventions

- Files: kebab-case (`board-card.tsx`, `api-client.ts`)
- Components: PascalCase (`BoardCard`, `TaskList`)
- Functions/variables: camelCase (`fetchBoards`, `taskCount`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- Database tables: snake_case (`boards`, `task_items`)

### File Organization

- Group by feature, not by type
- Colocate related files (component + styles + tests)
- Keep files focused (< 300 lines ideally)
- Export from index.ts for cleaner imports

### React Conventions

- Functional components only (no class components)
- Custom hooks for reusable logic (prefix with `use`)
- Props interfaces named `<Component>Props`
- Destructure props in component signature
- Use Context API for global state, TanStack Query for server state

### Backend Conventions

- One route handler per file in `routes/` directory
- Validate input using Zod or similar
- Use Drizzle ORM for all database operations
- Transaction support for multi-step operations
- Separate business logic from route handlers when complex

---

## Testing Standards

### Backend Tests (bun:test)

- Test file naming: `*.test.ts`
- Integration tests for all API endpoints
- Test happy path + error cases
- Use test database (separate from development)
- Clean up test data after each test
- Minimum 70% coverage

### Test Structure

- Arrange-Act-Assert pattern
- Descriptive test names: `it('should return 404 when board not found')`
- Group related tests with `describe` blocks
- Mock external dependencies, not database

### What to Test (Backend)

- ✅ All API endpoints (CRUD operations)
- ✅ Input validation (invalid data handling)
- ✅ Error cases (not found, server errors)
- ✅ Business logic (ordering, cascading deletes)
- ❌ Don't test framework code (Hono internals)
- ❌ Don't test Drizzle ORM queries directly

---

## Documentation Standards

### Code Comments

- Comment **why**, not **what** (code should be self-documenting)
- Complex algorithms need explanation
- Non-obvious business logic needs context
- TODOs must include: `// TODO: [description] - [your name/date]`

### API Documentation

- Document endpoints in PHASE_N_PLAN.md
- Include: method, path, request body, response, status codes
- Update when endpoints change

### ADRs (Architectural Decision Records)

- Create ADR for significant technical decisions
- Follow template: Context, Options, Decision, Consequences
- Number sequentially: `001-decision-name.md`
- Update status when decisions are revisited

### README Files

- Root README.md: Project overview, setup instructions
- Package README: Purpose, API, usage examples

---

## Git Standards

### Commit Messages

Format: `<type>(<scope>): <subject>`

**Keep it concise and professional** - no lengthy explanations or learning notes in commit messages.

Types:

- `feat` - New feature
- `fix` - Bug fix
- `chore` - Tooling, dependencies, configs
- `docs` - Documentation only
- `test` - Test additions/changes
- `refactor` - Code refactoring (no behavior change)

**Good Examples:**

- `feat(boards): add workspace view with board list`
- `feat(backend): implement GET /api/boards endpoint`
- `fix(tasks): resolve optimistic update rollback`
- `chore(deps): update React to v19`

**Bad Examples (too verbose):**

- ❌ Multi-paragraph commit messages with "Backend:", "Frontend:", "Learning goals:"
- ❌ Listing implementation details that are visible in the code diff
- ❌ Educational notes about what was learned

**Guidelines:**

- Single line subject (max 72 characters)
- Optional body for complex changes (keep brief)
- Focus on WHAT changed, not HOW (code shows how)
- Use imperative mood ("add" not "added")
- No period at end of subject line

### Branch Naming

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `chore/<description>` - Tooling/setup
- `docs/<description>` - Documentation

### PR Standards

- Title: Same format as commit messages
- Description: What changed, why, testing done
- Link to related issues/ADRs if applicable
- Self-review before creating PR

---

## Session Continuity

### Before Starting Work (New Session)

1. Read PROJECT_OVERVIEW.md for project context
2. Read docs/PHASE_N_PLAN.md for current phase
3. Check docs/adr/ for recent architectural decisions
4. Review recent commits/PRs to understand current state
5. Ask user: "What should we work on today?"

### After Completing Work (End of Session)

1. Ensure all changes are committed
2. Update PHASE_N_PLAN.md checkboxes if slice completed
3. Document any blockers or open questions
4. Create ADR if significant decisions were made
5. Summarize progress for user

### Context Gathering

- Use Task tool with 'explore' agent for codebase research
- Read existing code before proposing changes
- Check for similar patterns in codebase
- Verify assumptions against documentation

---

## Decision-Making Protocol

### When to Ask User

- Ambiguous requirements
- Multiple valid implementation approaches
- Breaking changes to existing features
- Significant architecture decisions
- Trade-offs between simplicity and features
- Deviating from documented plans

### When to Decide Autonomously

- Minor implementation details
- Standard patterns (already documented)
- Bug fixes (obvious corrections)
- Code organization (following established conventions)
- Refactoring (no behavior change)

### When to Create ADR

- Database schema decisions
- Authentication/authorization strategy
- State management approach
- API design patterns
- Third-party library selection
- Deployment architecture

---

## Quality Checklist (Before PR)

### Code Quality

- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] No linting errors (`eslint .`)
- [ ] Code follows Prettier formatting
- [ ] No console.logs (use proper logging)
- [ ] No commented-out code
- [ ] No TODO comments without context

### Functionality

- [ ] Feature works as expected manually
- [ ] Error cases handled gracefully
- [ ] Loading states implemented
- [ ] Backend tests passing
- [ ] CI pipeline passes

### Documentation

- [ ] Complex logic has comments
- [ ] API changes documented
- [ ] ADR created if needed
- [ ] PHASE_N_PLAN.md updated
