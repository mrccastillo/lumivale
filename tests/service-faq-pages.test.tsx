import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test, vi } from "vitest";
import { getDefaultServices } from "@/lib/services";
import ServiceDetailPage from "@/app/services/[slug]/page";

const mocks = vi.hoisted(() => ({ service: vi.fn(), services: vi.fn() }));
vi.mock("@/lib/services", async (original) => ({ ...await original<typeof import("@/lib/services")>(), getPublishedServiceBySlugForSite: mocks.service, getPublishedServicesForSite: mocks.services }));
beforeEach(() => {
  const service = getDefaultServices()[0];
  mocks.service.mockResolvedValue({ ...service, faqs: [{ id: "q2", question: "Second question?", answer: "Line one\n<script>private-code</script>" }, { id: "q1", question: "First question?", answer: "Answer" }], privateContent: { heroDescription: "PRIVATE-HERO", pricePreview: "PRIVATE-PRICE", pricingLines: [{ label: "PRIVATE-RATE", value: "$98765" }], examplePlatforms: [{ id: "private", name: "PRIVATE-PLATFORM" }], exampleCards: [{ title: "PRIVATE-EXAMPLE", imageUrl: "https://private.example/secret.png" }] } });
  mocks.services.mockResolvedValue([getDefaultServices()[1], service]);
});
test("renders only public fields, ordered native disclosures, and public navigation", async () => {
  const element = await ServiceDetailPage({ params: Promise.resolve({ slug: "comment-campaign" }) });
  const html = renderToStaticMarkup(element);
  for (const sentinel of ["PRIVATE-HERO", "PRIVATE-PRICE", "PRIVATE-RATE", "$98765", "PRIVATE-PLATFORM", "PRIVATE-EXAMPLE", "https://private.example/secret.png"]) expect(html).not.toContain(sentinel);
  const { container } = render(element);
  const nav = within(screen.getByRole("navigation", { name: "Lumivale Services" }));
  expect(nav.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["/services/ugc-content-creation", "/services/comment-campaign"]);
  expect(nav.getByRole("link", { name: "Comment Campaign" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/#services");
  expect(Array.from(container.querySelectorAll("summary")).map(row => row.textContent)).toEqual(["Second question?+", "First question?+"]);
  expect(container.querySelectorAll("details[open]")).toHaveLength(0);
  expect(container.querySelector("script")).toBeNull();
  expect(screen.getByText(/Line one/)).toHaveClass("whitespace-pre-line");
});
test("empty FAQs do not fall back to homepage questions", async () => {
  mocks.service.mockResolvedValue({ ...getDefaultServices()[0], faqs: [] });
  render(await ServiceDetailPage({ params: Promise.resolve({ slug: "comment-campaign" }) }));
  expect(screen.getByText("No FAQs available yet.")).toBeInTheDocument();
  expect(screen.queryByText("Is this only for startups?")).toBeNull();
});
test("missing or unpublished service is not found", async () => {
  mocks.service.mockResolvedValue(null);
  await expect(ServiceDetailPage({ params: Promise.resolve({ slug: "unpublished" }) })).rejects.toThrow();
});
