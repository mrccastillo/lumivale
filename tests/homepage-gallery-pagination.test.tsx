import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { HomepageCaseStudies } from "@/components/homepage-case-studies";
import { HomepageReels } from "@/components/homepage-reels";
import { defaultCaseStudies } from "@/lib/case-studies";

const studies = Array.from({ length: 13 }, (_, i) => ({ ...defaultCaseStudies[0], slug: `story-${i}`, title: `Story ${i}`, clientName: `Client ${i}` }));
const reels = Array.from({ length: 9 }, (_, i) => ({ id: String(i), title: `Reel ${i}`, clientName: `Client ${i}`, platform: "Instagram", url: `https://instagram.com/reel/${i}`, thumbnailUrl: "https://res.cloudinary.com/demo/reel.jpg", views: "100", likes: "10", comments: "2", status: "published" as const, sortOrder: i }));

test("case studies page in sets of six, wrap, and keep story destinations", () => {
  const { container, rerender } = render(<HomepageCaseStudies caseStudies={studies} />);
  expect(container.querySelectorAll("article")).toHaveLength(6);
  fireEvent.click(screen.getByRole("button", { name: "Next case studies" }));
  expect(container.querySelectorAll("article")).toHaveLength(6);
  expect(screen.getByRole("link", { name: "Read the full story: Story 6" })).toHaveAttribute("href", "/case-studies/story-6");
  expect(screen.queryByText("Client 0")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next case studies" }));
  expect(container.querySelectorAll("article")).toHaveLength(1);
  expect(screen.getByRole("status")).toHaveTextContent("3 / 3");
  fireEvent.click(screen.getByRole("button", { name: "Next case studies" }));
  expect(screen.getByText("Client 0")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Previous case studies" }));
  expect(screen.getByText("Client 12")).toBeInTheDocument();
  rerender(<HomepageCaseStudies caseStudies={studies.slice(0, 6)} />);
  expect(container.querySelectorAll("article")).toHaveLength(6);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("reels page in sets of four, wrap, and handle a shrinking collection", () => {
  const { container, rerender } = render(<HomepageReels reels={reels} />);
  expect(container.querySelectorAll("article")).toHaveLength(4);
  fireEvent.click(screen.getByRole("button", { name: "Next reels" }));
  expect(container.querySelectorAll("article")).toHaveLength(4);
  expect(screen.getByRole("link", { name: "View Reel 4 on Instagram (opens in a new tab)" })).toHaveAttribute("href", reels[4].url);
  expect(screen.queryByText("Reel 0")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next reels" }));
  expect(container.querySelectorAll("article")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Next reels" }));
  expect(screen.getByRole("status")).toHaveTextContent("1 / 3");
  fireEvent.click(screen.getByRole("button", { name: "Previous reels" }));
  expect(screen.getByText("Reel 8")).toBeInTheDocument();
  rerender(<HomepageReels reels={reels.slice(0, 4)} />);
  expect(container.querySelectorAll("article")).toHaveLength(4);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  rerender(<HomepageReels reels={[]} />);
  expect(container).toBeEmptyDOMElement();
});
