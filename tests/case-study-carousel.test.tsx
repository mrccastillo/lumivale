import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { CaseStudyCarousel } from "@/components/case-study-carousel";

afterEach(() => vi.unstubAllGlobals());

test("carousel navigates, wraps, and updates its counter after scrolling", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
  render(<CaseStudyCarousel><article>First story</article><article>Second story</article><article>Third story</article></CaseStudyCarousel>);
  const track = screen.getByLabelText("Case study slides");
  Array.from(track.children).forEach((slide, index) => Object.defineProperty(slide, "offsetLeft", { value: index * 500 }));
  const scrollTo = vi.fn(({ left }) => { track.scrollLeft = left; fireEvent.scroll(track); });
  track.scrollTo = scrollTo;
  fireEvent.click(screen.getByRole("button", { name: "Next case study" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 500, behavior: "instant" });
  expect(screen.getByRole("status")).toHaveTextContent("Case study 2 of 3");
  fireEvent.keyDown(track, { key: "ArrowLeft" });
  expect(screen.getByRole("status")).toHaveTextContent("Case study 1 of 3");
  fireEvent.click(screen.getByRole("button", { name: "Previous case study" }));
  expect(screen.getByRole("status")).toHaveTextContent("Case study 3 of 3");
  fireEvent.click(screen.getByRole("button", { name: "Next case study" }));
  expect(screen.getByRole("status")).toHaveTextContent("Case study 1 of 3");
});

test("one case study shows its count and disabled navigation", () => {
  render(<CaseStudyCarousel><article><a href="/case-studies/example">Read story</a></article></CaseStudyCarousel>);
  expect(screen.getByRole("link", { name: "Read story" })).toHaveAttribute("href", "/case-studies/example");
  expect(screen.getByRole("button", { name: "Previous case study" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Next case study" })).toBeDisabled();
  expect(screen.getByRole("status")).toHaveTextContent("Case study 1 of 1");
});
