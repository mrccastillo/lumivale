import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import type { Db } from "mongodb";
import { reorderCaseStudies } from "@/lib/case-study-order";
import { getAdminCaseStudies } from "@/lib/case-studies";
import { CaseStudyOrder } from "@/app/admin/case-studies/case-study-order";
vi.mock("@/lib/case-studies", () => ({ getAdminCaseStudies: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const studies = [{ slug: "a", title: "Alpha", status: "published" }, { slug: "b", title: "Beta", status: "draft" }];
const bulkWrite = vi.fn();
const db = { collection: () => ({ bulkWrite }) } as unknown as Db;
beforeEach(() => { vi.clearAllMocks(); vi.mocked(getAdminCaseStudies).mockResolvedValue(studies as Awaited<ReturnType<typeof getAdminCaseStudies>>); });

test("validates the complete order before changing anything", async () => {
  await expect(reorderCaseStudies(db, ["a", "a"])).rejects.toThrow("once");
  await expect(reorderCaseStudies(db, ["a"])).rejects.toThrow("changed");
  await expect(reorderCaseStudies(db, ["a", "unknown"])).rejects.toThrow("changed");
  expect(bulkWrite).not.toHaveBeenCalled();
});
test("stores consecutive positions without overwriting existing story content", async () => {
  await reorderCaseStudies(db, ["b", "a"]);
  const writes = bulkWrite.mock.calls[0][0];
  expect(writes[0].updateOne.filter).toEqual({ slug: "b" });
  expect(writes[0].updateOne.update.$set.sortOrder).toBe(1);
  expect(writes[1].updateOne.update.$set.sortOrder).toBe(2);
  expect(writes[0].updateOne.update.$set).not.toHaveProperty("title");
  expect(writes[0].updateOne.update.$setOnInsert.title).toBe("Beta");
});
test("moves, resets, and saves the full list", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal("fetch", fetchMock);
  render(<CaseStudyOrder studies={studies} />);
  fireEvent.click(screen.getByText("Reorder case studies"));
  fireEvent.click(screen.getByRole("button", { name: "Move Beta up" }));
  expect(screen.getByRole("button", { name: "Move Beta up" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(screen.getByRole("button", { name: "Move Alpha up" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Move Alpha down" }));
  fireEvent.click(screen.getByRole("button", { name: "Save order" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ order: ["b", "a"] });
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Order saved"));
  vi.unstubAllGlobals();
});
