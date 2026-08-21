# Angular Virtual Scroll Showcase

A frontend-performance case study for [Angular](https://angular.dev/): how to virtualize a long
list of **variable-height** items. The app loads a realistic, searchable organization hierarchy
from a backend and renders it two ways so you can see the difference in DOM work side by side.

## What it demonstrates

The centerpiece is an interactive comparison of two selectors fed the exact same data and behavior:

| Version                 | Rendering                                             | Why it matters                                                                                                                     |
| ----------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Baseline (“before”)** | Renders **every** row that matches the current search | Correct and simple, but the DOM (and the work Angular does per frame) grows with the whole dataset and with every keystroke.       |
| **Optimized (“after”)** | Keeps only a **measured window** of rows in the DOM   | Search and selection behave identically, but the rendered surface stays small no matter how large or filtered the dataset becomes. |

Both selectors stay fully interactive — you can search and scroll each one and watch the reported
interaction latency update live. The optimized side also reports how many entities are currently
rendered versus how many the backend returned.

The reason fixed-height scrolling doesn't apply here: every top-level group has a different number of
children, so each virtual item has a different height. A single CDK `itemSize` can't model that. The
showcase solves it with a custom strategy built on **stable Angular CDK extension points** instead of
the experimental autosize package.

## The technique

The custom `VirtualScrollStrategy` in
[`variable-size-virtual-scroll.ts`](src/app/modules/virtual-scroll/showcase/directives/variable-size-virtual-scroll.ts)
takes a three-step approach:

1. **Estimate group heights** — use the known 64px parent row and 44px child row dimensions to seed
   per-item estimates.
2. **Resolve the visible range** — binary-search cumulative offsets and add a small pixel buffer so
   the viewport always has content just past the edges.
3. **Measure and correct** — observe rendered groups (with `ResizeObserver`) and update the offset
   map whenever the browser's actual dimensions differ from the estimates.

The strategy feeds the CDK viewport its total content size, rendered range, and content offset, so
`cdk-virtual-scroll-viewport` and `*cdkVirtualFor` drive the DOM exactly as they do for fixed-size
lists — only the positioning math is custom.

Key source files, all under
[`src/app/modules/virtual-scroll/`](src/app/modules/virtual-scroll/):

| File                                                  | Role                                                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `showcase/directives/variable-size-virtual-scroll.ts` | The custom `VirtualScrollStrategy` plus a directive that wires it to the CDK viewport.      |
| `showcase/directives/measure-virtual-item.ts`         | Measures a rendered item (`ResizeObserver`) and reports its real size back to the strategy. |
| `showcase/components/after-org-selector.ts`           | The optimized selector using the CDK viewport + custom strategy.                            |
| `showcase/components/before-org-selector.ts`          | The baseline selector that renders all matching rows.                                       |
| `showcase/api/organizations-api.ts`                   | Loads and validates the organization hierarchy with Angular `httpResource`.                 |
| `showcase/data/organization-data.ts`                  | Organization height, entity-count, and filtering helpers.                                   |
| `showcase/virtual-scroll-showcase.ts`                 | The page composing both selectors and its async view states.                                |

## Running the showcase

**Requirements:** Node.js 24 and the pinned pnpm version from `package.json` (`pnpm@11.5.2`).
Graphviz is needed only for generating dependency-graph SVGs; Docker only for the production image.

```bash
pnpm install
pnpm start
```

Open `http://localhost:4200` and select **Virtual Scroll** from the navigation to explore the
comparison. The dev server reloads when source files change.

The organization list is requested from `${apiBaseURL}/organizations`. With the checked-in
`public/config.json`, this is `/api/organizations`. The endpoint must return a JSON array whose
top-level entries contain `id`, `name`, `location`, `memberCount`, `initials`, `accent`, and a
`subOrganizations` array. Child entries contain the same fields except `subOrganizations`.

## Project layout

This codebase is an Angular 22 standalone app following a modular-monolith structure, so the
showcase lives cleanly inside a lazy-loaded feature boundary:

```text
src/app/
├── core/       # Singleton application infrastructure and cross-cutting services
├── common/     # Reusable application code shared by features and layouts
├── layout/     # Application shells and layout composition
├── modules/
│   └── virtual-scroll/    # This showcase, as an independently routed feature
│       └── showcase/      # directives, components, data, models for the case study
└── shared/ui/  # Project-owned spartan Helm components
```

## Quality and validation

The project ships a full local quality gate, the same one CI runs:

```bash
pnpm start          # Start the development server
pnpm test           # Run unit tests
pnpm lint           # Run ESLint and module-boundary checks
pnpm format         # Format project files
pnpm format:check   # Check formatting without changing files
pnpm verify:quick   # Lint + unit tests, for fast iteration
pnpm verify         # Complete CI quality gate (format, lint, test, build)
pnpm analyze        # Production build + interactive bundle analysis
pnpm deps:graph     # Generate source dependency-graph SVGs into deps/
```

The showcase includes unit tests for the virtual-scroll strategy, organization API boundary, page
states, and data helpers, including failure and boundary cases.

## Working on this repository

`AGENTS.md` is the entry point for coding agents. It documents the modular-monolith architecture
(`core` / `common` / `layout` / `modules` / `shared/ui` with lint-enforced import boundaries),
Angular and [spartan/ui](https://www.spartan.ng/) conventions, testing expectations, and the
definition of done. Before handing off a change, run the same deterministic quality gate as CI:

```bash
pnpm verify
```

Bundled infrastructure includes spartan/ui + Tailwind CSS 4 for the UI shell, NgRx Signal Store for
application state, and optional Sentry error reporting driven by browser runtime configuration
(`public/config.json` / `SENTRY_DSN`). The GitHub Actions workflow in `.github/workflows/ci.yml`
runs the full `pnpm verify` gate on pushes and pull requests.

## Further reading

- [Angular documentation](https://angular.dev/)
- [Angular CDK virtual scrolling](https://material.angular.io/cdk/scrolling/overview)
- [Angular CLI reference](https://angular.dev/tools/cli)
- [spartan/ui documentation](https://www.spartan.ng/)
