import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { getSiteContentForSite } from "@/lib/site-content";
import AboutPage from "@/app/about/page";
vi.mock("@/lib/site-content", () => ({ getSiteContentForSite: vi.fn() }));

test("renders saved About content and visible founder biographies", async () => {
  vi.mocked(getSiteContentForSite).mockResolvedValue({ ...defaultSiteContent, aboutHeading: "Our team", aboutFounder1Name: "Alex", aboutFounder2Name: "", aboutFounder3Name: "" });
  render(await AboutPage());
  expect(screen.getByRole("heading", { name: "Our team", level: 1 })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Alex", level: 3 })).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByText(defaultSiteContent.aboutFounder1Summary)).toBeVisible();
  expect(screen.getByAltText("Alex portrait")).toHaveAttribute("src", defaultSiteContent.aboutFounder1Image);
  expect(screen.getByRole("link", { name: /Explore our services/ })).toHaveAttribute("href", "/#services");
});
