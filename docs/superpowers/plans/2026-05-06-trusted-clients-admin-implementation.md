# Trusted Clients Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the env-based trusted client allowlist with a Mongo-backed admin workflow, including a dedicated `/admin/trusted-clients` page for add, list, search, sort, and remove.

**Architecture:** Introduce a focused `lib/trusted-clients.ts` repository for persistence and approval lookup, then wire the public client-access request route to use Mongo instead of `TRUSTED_CLIENT_EMAILS`. Add a new server-rendered admin dashboard and two admin form-post routes that follow the existing `/admin/users` and `/api/admin/faqs` patterns, keeping removal scoped to future magic-link requests only.

**Tech Stack:** Next.js App Router, React server components, TypeScript, MongoDB, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Trusted Client Repository And Request-Flow Tests

**Files:**
- Create: `tests/trusted-clients.test.ts`
- Modify: `tests/client-access-request-route.test.ts`

- [ ] **Step 1: Write the failing repository tests**

Create `tests/trusted-clients.test.ts` with focused coverage for normalization, create, duplicate rejection, reverse-chronological listing, delete, and approval lookup.

```ts
import { describe, expect, test } from "vitest";

import {
  createTrustedClient,
  deleteTrustedClient,
  getTrustedClients,
  hasTrustedClientApproval,
} from "@/lib/trusted-clients";

describe("trusted clients repository", () => {
  test("creates normalized trusted clients and lists safe records", async () => {
    const db = createTrustedClientsTestDb();

    const created = await createTrustedClient(db, {
      email: " Client@Example.com ",
    });

    expect(created).toMatchObject({
      email: "client@example.com",
    });
    await expect(getTrustedClients(db)).resolves.toEqual([
      expect.objectContaining({ email: "client@example.com" }),
    ]);
  });

  test("rejects duplicate trusted client emails", async () => {
    const db = createTrustedClientsTestDb();

    await createTrustedClient(db, { email: "client@example.com" });

    await expect(
      createTrustedClient(db, { email: " CLIENT@example.com " }),
    ).rejects.toThrow("A trusted client with this email already exists.");
  });

  test("deletes trusted clients by id", async () => {
    const db = createTrustedClientsTestDb();
    const created = await createTrustedClient(db, { email: "client@example.com" });

    await deleteTrustedClient(db, created.id);

    await expect(getTrustedClients(db)).resolves.toEqual([]);
  });

  test("matches approvals using normalized email lookups", async () => {
    const db = createTrustedClientsTestDb();
    await createTrustedClient(db, { email: "client@example.com" });

    await expect(hasTrustedClientApproval(db, " Client@Example.com ")).resolves.toBe(true);
    await expect(hasTrustedClientApproval(db, "other@example.com")).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Write the failing request-route test updates**

Update `tests/client-access-request-route.test.ts` so it mocks Mongo-backed approval instead of `TRUSTED_CLIENT_EMAILS`.

```ts
const getMongoDbMock = vi.hoisted(() => vi.fn().mockResolvedValue("test-db"));
const hasTrustedClientApprovalMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/mongodb", () => ({
  getMongoDb: getMongoDbMock,
}));

vi.mock("@/lib/trusted-clients", () => ({
  hasTrustedClientApproval: hasTrustedClientApprovalMock,
}));

test("sends a magic link for an approved email", async () => {
  process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
  hasTrustedClientApprovalMock.mockResolvedValue(true);
  sendTrustedClientMagicLinkMock.mockResolvedValue({ mode: "email" });

  // existing POST request setup...

  expect(hasTrustedClientApprovalMock).toHaveBeenCalledWith("test-db", "client@example.com");
  expect(sendTrustedClientMagicLinkMock.mock.calls[0]?.[0]).toMatchObject({
    email: "client@example.com",
  });
});

test("does not send a magic link for an unapproved email", async () => {
  process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET = "super-secret";
  hasTrustedClientApprovalMock.mockResolvedValue(false);

  // existing POST request setup...

  expect(sendTrustedClientMagicLinkMock).not.toHaveBeenCalled();
});
```

- [ ] **Step 3: Run the targeted tests to verify they fail**

Run: `npm test -- tests/trusted-clients.test.ts tests/client-access-request-route.test.ts`
Expected: FAIL because `@/lib/trusted-clients` does not exist yet and the request route still depends on env-backed approval.

- [ ] **Step 4: Commit the failing-test checkpoint**

```bash
git add tests/trusted-clients.test.ts tests/client-access-request-route.test.ts
git commit -m "test: cover trusted client repository and request flow"
```

### Task 2: Trusted Client Repository And Public Request Flow

**Files:**
- Create: `lib/trusted-clients.ts`
- Modify: `app/client-access/request/route.ts`
- Modify: `lib/trusted-client.ts`
- Test: `tests/trusted-clients.test.ts`
- Test: `tests/client-access-request-route.test.ts`

- [ ] **Step 1: Implement the repository module**

Create `lib/trusted-clients.ts` using the same repository shape as `lib/admin-users.ts`, but without passwords.

```ts
import { ObjectId, type Filter } from "mongodb";

import { normalizeTrustedClientEmail } from "@/lib/trusted-client";

export type TrustedClient = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TrustedClientInput = {
  email: string;
};

const COLLECTION = "trustedClients";

export function parseTrustedClientFormData(formData: FormData): TrustedClientInput {
  return {
    email: String(formData.get("email") ?? ""),
  };
}

export async function createTrustedClient(db: TrustedClientsDb, input: TrustedClientInput) {
  const email = normalizeTrustedClientEmail(input.email);

  if (!email) {
    throw new Error("Email is required.");
  }

  const existing = await collection(db).findOne({ email });

  if (existing) {
    throw new Error("A trusted client with this email already exists.");
  }

  const now = new Date();
  const result = await collection(db).insertOne({
    _id: new ObjectId(),
    createdAt: now,
    email,
    updatedAt: now,
  });

  return {
    createdAt: now,
    email,
    id: String(result.insertedId),
    updatedAt: now,
  };
}

export async function hasTrustedClientApproval(db: TrustedClientsDb, email: string) {
  const normalizedEmail = normalizeTrustedClientEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  const record = await collection(db).findOne({ email: normalizedEmail });

  return Boolean(record);
}
```

- [ ] **Step 2: Remove env-backed whitelist helpers from `lib/trusted-client.ts`**

Keep token creation and cookie validation intact, but remove the whitelist-specific exports.

```ts
export function normalizeTrustedClientEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createMagicLinkToken(email: string) {
  return createSignedToken({
    email: normalizeTrustedClientEmail(email),
    exp: Math.floor(Date.now() / 1000) + MAGIC_LINK_MAX_AGE_SECONDS,
    type: "magic-link",
  });
}
```

Delete:

```ts
export function getTrustedClientEmails() { /* remove */ }
export function isTrustedClientEmail(email: string) { /* remove */ }
```

- [ ] **Step 3: Wire the request route to Mongo-backed approval**

Update `app/client-access/request/route.ts` to look up approval through Mongo before creating a token.

```ts
import { getMongoDb } from "@/lib/mongodb";
import { hasTrustedClientApproval } from "@/lib/trusted-clients";
import {
  createMagicLinkToken,
  normalizeTrustedClientEmail,
} from "@/lib/trusted-client";

export async function POST(request: Request) {
  const db = await getMongoDb();
  const formData = await request.formData();
  const email = normalizeTrustedClientEmail(String(formData.get("email") ?? ""));

  if (!email || !(await hasTrustedClientApproval(db, email))) {
    return redirectToClientAccess("/client-access?sent=1");
  }

  const token = createMagicLinkToken(email);
  // existing verifyUrl + sendTrustedClientMagicLink flow remains unchanged
}
```

- [ ] **Step 4: Run the targeted tests to verify they pass**

Run: `npm test -- tests/trusted-clients.test.ts tests/client-access-request-route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit the repository and request-flow changes**

```bash
git add lib/trusted-clients.ts lib/trusted-client.ts app/client-access/request/route.ts tests/trusted-clients.test.ts tests/client-access-request-route.test.ts
git commit -m "feat: move trusted client approval to mongodb"
```

### Task 3: Admin Trusted Clients Tests

**Files:**
- Create: `tests/admin-trusted-clients-dashboard.test.tsx`
- Create: `tests/admin-trusted-clients-route.test.ts`
- Create: `tests/admin-trusted-clients-delete-route.test.ts`
- Modify: `tests/admin-pages.test.tsx`
- Modify: `tests/admin-shell.test.tsx`

- [ ] **Step 1: Write the failing admin page smoke test**

Extend `tests/admin-pages.test.tsx` to render the new dashboard and assert the core structure.

```ts
import AdminTrustedClientsPage from "@/app/admin/trusted-clients/page";

vi.mock("@/lib/trusted-clients", () => ({
  getTrustedClients: vi.fn().mockResolvedValue([
    {
      id: "trusted-1",
      email: "client@example.com",
      createdAt: new Date("2026-05-06T08:00:00.000Z"),
      updatedAt: new Date("2026-05-06T08:00:00.000Z"),
    },
  ]),
}));

test("renders the admin trusted clients page and creation form", async () => {
  render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({}) }));

  expect(screen.getByRole("heading", { name: "Trusted Clients", level: 1 })).toBeInTheDocument();
  expect(screen.getByText("Pricing Access")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "client@example.com", level: 3 })).toBeInTheDocument();
  expect(screen.getByLabelText("Email")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add trusted client" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Write the failing dashboard behavior tests**

Create `tests/admin-trusted-clients-dashboard.test.tsx` for metrics, search, sort, empty state, and no-match state.

```ts
test("renders metrics, search, sort, and list rows", async () => {
  render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({}) }));

  expect(screen.getByText("Total trusted clients")).toBeInTheDocument();
  expect(screen.getByText("Visible results")).toBeInTheDocument();
  expect(screen.getByRole("searchbox", { name: "Search trusted client email" })).toBeInTheDocument();
  expect(screen.getByLabelText("Sort")).toBeInTheDocument();
});

test("filters trusted clients by email query", async () => {
  render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({ q: "alex" }) }));

  expect(screen.getByText("alex@example.com")).toBeInTheDocument();
  expect(screen.queryByText("zoe@example.com")).not.toBeInTheDocument();
});

test("shows a no-match state when search removes every record", async () => {
  render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({ q: "missing" }) }));

  expect(screen.getByText("No matching trusted clients.")).toBeInTheDocument();
});

test("shows an empty state when no trusted clients exist", async () => {
  getTrustedClientsMock.mockResolvedValueOnce([]);

  render(await AdminTrustedClientsPage({ searchParams: Promise.resolve({}) }));

  expect(screen.getByText("No trusted clients yet.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add trusted client" })).toBeInTheDocument();
});
```

- [ ] **Step 3: Write the failing admin route tests**

Create one test file for create and one for remove so each route stays focused.

```ts
// tests/admin-trusted-clients-route.test.ts
vi.mock("@/lib/trusted-clients", () => ({
  createTrustedClient: createTrustedClientMock,
  parseTrustedClientFormData: parseTrustedClientFormDataMock,
}));

test("redirects back to the trusted clients page after create", async () => {
  const { POST } = await import("@/app/api/admin/trusted-clients/route");
  const response = await POST(new Request("http://localhost/api/admin/trusted-clients", {
    method: "POST",
    body: new FormData(),
  }));

  expect(response.headers.get("location")).toBe("/admin/trusted-clients?status=created");
  expect(requireAdminAccessMock).toHaveBeenCalledTimes(1);
});
```

```ts
// tests/admin-trusted-clients-delete-route.test.ts
vi.mock("@/lib/trusted-clients", () => ({
  deleteTrustedClient: deleteTrustedClientMock,
}));

test("redirects back to the trusted clients page after remove", async () => {
  const { POST } = await import("@/app/api/admin/trusted-clients/[id]/route");
  const response = await POST(
    new Request("http://localhost/api/admin/trusted-clients/trusted-1", { method: "POST" }),
    { params: Promise.resolve({ id: "trusted-1" }) },
  );

  expect(response.headers.get("location")).toBe("/admin/trusted-clients?status=removed");
  expect(requireAdminAccessMock).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 4: Add the failing sidebar coverage**

Update `tests/admin-shell.test.tsx` so the admin nav is expected to include `Trusted Clients`.

```ts
expect(screen.getByRole("link", { name: "Trusted Clients" })).toHaveAttribute(
  "href",
  "/admin/trusted-clients",
);
```

- [ ] **Step 5: Run the targeted admin tests to verify they fail**

Run: `npm test -- tests/admin-pages.test.tsx tests/admin-shell.test.tsx tests/admin-trusted-clients-dashboard.test.tsx tests/admin-trusted-clients-route.test.ts tests/admin-trusted-clients-delete-route.test.ts`
Expected: FAIL because the new page, routes, and nav entry do not exist yet.

- [ ] **Step 6: Commit the failing admin test checkpoint**

```bash
git add tests/admin-pages.test.tsx tests/admin-shell.test.tsx tests/admin-trusted-clients-dashboard.test.tsx tests/admin-trusted-clients-route.test.ts tests/admin-trusted-clients-delete-route.test.ts
git commit -m "test: cover trusted clients admin workflow"
```

### Task 4: Admin Trusted Clients Page, Routes, And Nav

**Files:**
- Create: `app/admin/trusted-clients/page.tsx`
- Create: `app/api/admin/trusted-clients/route.ts`
- Create: `app/api/admin/trusted-clients/[id]/route.ts`
- Modify: `app/admin/admin-nav.tsx`
- Test: `tests/admin-pages.test.tsx`
- Test: `tests/admin-shell.test.tsx`
- Test: `tests/admin-trusted-clients-dashboard.test.tsx`
- Test: `tests/admin-trusted-clients-route.test.ts`
- Test: `tests/admin-trusted-clients-delete-route.test.ts`

- [ ] **Step 1: Add the admin navigation link**

Extend the admin sidebar link list with a dedicated trusted-clients entry.

```ts
const adminLinks = [
  { href: "/admin/blogs", icon: BlogsIcon, label: "Blogs" },
  { href: "/admin/testimonials", icon: TestimonialsIcon, label: "Testimonials" },
  { href: "/admin/faqs", icon: FaqsIcon, label: "FAQs" },
  { href: "/admin/users", icon: UsersIcon, label: "Users" },
  { href: "/admin/trusted-clients", icon: TrustedClientsIcon, label: "Trusted Clients" },
];
```

- [ ] **Step 2: Implement the admin page**

Create `app/admin/trusted-clients/page.tsx` by following the `app/admin/users/page.tsx` shape, but scoped to trusted-client management.

```ts
import { requireAdminAccess } from "@/lib/admin-auth";
import { type TrustedClient, getTrustedClients } from "@/lib/trusted-clients";
import { getMongoDb } from "@/lib/mongodb";

const SORT_OPTIONS = ["newest", "oldest", "email"] as const;

export default async function AdminTrustedClientsPage({ searchParams }: AdminTrustedClientsPageProps = {}) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const clients = await getTrustedClients(db);
  const params = await searchParams;
  const query = firstValue(params?.q).trim();
  const sort = parseSort(firstValue(params?.sort));
  const status = firstValue(params?.status);
  const error = firstValue(params?.error);
  const visibleClients = filterAndSortTrustedClients(clients, { query, sort });

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--lumivale-panel)]">
          Pricing Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--lumivale-ink)]">
          Trusted Clients
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--lumivale-muted)]">
          Approve client emails that can request private pricing links.
        </p>
      </header>

      {status === "created" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Trusted client added.
        </p>
      ) : null}
      {status === "removed" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Trusted client removed.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total trusted clients" value={clients.length} note="All approved pricing emails" />
        <MetricCard label="Visible results" value={visibleClients.length} note="Matches the current search" />
        <MetricCard label="Newest approval" value={newestClient ? formatShortDate(newestClient.createdAt) : "None"} note={newestClient ? "Most recently approved email" : "No trusted clients yet"} />
      </section>
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section>
          <form action="/api/admin/trusted-clients" method="post">{/* email input + add button */}</form>
        </section>
        <section>
          <form action="/admin/trusted-clients">{/* q + sort controls */}</form>
          {/* render empty state, no-match state, or mapped trusted client rows with remove forms */}
        </section>
      </div>
    </section>
  );
}
```

For the list row action, use a server form per record:

```tsx
<form action={`/api/admin/trusted-clients/${client.id}`} method="post">
  <button
    type="submit"
    className="rounded-lg border border-[var(--lumivale-admin-border)] px-4 py-2 text-sm font-semibold text-[var(--lumivale-panel)]"
  >
    Remove
  </button>
</form>
```

- [ ] **Step 3: Implement the create route**

Create `app/api/admin/trusted-clients/route.ts` following the FAQ create-route pattern, including explicit redirects for success and duplicate/validation errors.

```ts
import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { createTrustedClient, parseTrustedClientFormData } from "@/lib/trusted-clients";
import { getMongoDb } from "@/lib/mongodb";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, "http://localhost"), 303);
  response.headers.set("location", path);
  return response;
}

function buildCreateErrorHref(message: string) {
  const params = new URLSearchParams({ error: message });
  return `/admin/trusted-clients?${params.toString()}`;
}

export async function POST(request: Request) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const formData = await request.formData();

  try {
    await createTrustedClient(db, parseTrustedClientFormData(formData));
  } catch (error) {
    return redirectTo(buildCreateErrorHref(getErrorMessage(error)));
  }

  return redirectTo("/admin/trusted-clients?status=created");
}
```

- [ ] **Step 4: Implement the remove route**

Create `app/api/admin/trusted-clients/[id]/route.ts` with admin protection and safe redirect behavior.

```ts
import { NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/admin-auth";
import { deleteTrustedClient } from "@/lib/trusted-clients";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdminAccess();
  const db = await getMongoDb();
  const { id } = await params;

  try {
    await deleteTrustedClient(db, id);
  } catch {
    return redirectTo("/admin/trusted-clients?error=Could+not+remove+trusted+client.");
  }

  return redirectTo("/admin/trusted-clients?status=removed");
}
```

- [ ] **Step 5: Run the targeted admin tests to verify they pass**

Run: `npm test -- tests/admin-pages.test.tsx tests/admin-shell.test.tsx tests/admin-trusted-clients-dashboard.test.tsx tests/admin-trusted-clients-route.test.ts tests/admin-trusted-clients-delete-route.test.ts`
Expected: PASS

- [ ] **Step 6: Commit the admin workflow implementation**

```bash
git add app/admin/admin-nav.tsx app/admin/trusted-clients/page.tsx app/api/admin/trusted-clients/route.ts app/api/admin/trusted-clients/[id]/route.ts tests/admin-pages.test.tsx tests/admin-shell.test.tsx tests/admin-trusted-clients-dashboard.test.tsx tests/admin-trusted-clients-route.test.ts tests/admin-trusted-clients-delete-route.test.ts
git commit -m "feat: add trusted clients admin dashboard"
```

### Task 5: Full Verification

**Files:**
- Verify only

- [ ] **Step 1: Run the focused trusted-client test surface**

Run: `npm test -- tests/trusted-clients.test.ts tests/client-access-request-route.test.ts tests/admin-pages.test.tsx tests/admin-shell.test.tsx tests/admin-trusted-clients-dashboard.test.tsx tests/admin-trusted-clients-route.test.ts tests/admin-trusted-clients-delete-route.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: Review the final diff**

Run: `git diff -- app/client-access/request/route.ts lib/trusted-client.ts lib/trusted-clients.ts app/admin/admin-nav.tsx app/admin/trusted-clients/page.tsx app/api/admin/trusted-clients/route.ts app/api/admin/trusted-clients/[id]/route.ts tests/trusted-clients.test.ts tests/client-access-request-route.test.ts tests/admin-pages.test.tsx tests/admin-shell.test.tsx tests/admin-trusted-clients-dashboard.test.tsx tests/admin-trusted-clients-route.test.ts tests/admin-trusted-clients-delete-route.test.ts`
Expected: Only the trusted-clients Mongo workflow, admin dashboard, and related tests are present.
