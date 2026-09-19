import { expect, test, vi } from "vitest";
import { redirect } from "next/navigation";
import CaseStudiesPage from "@/app/case-studies/page";

vi.mock("next/navigation", () => ({ redirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }) }));

test("redirects the removed listing to the homepage case studies section", () => {
  expect(() => CaseStudiesPage()).toThrow("NEXT_REDIRECT");
  expect(redirect).toHaveBeenCalledWith("/#case-studies");
});
