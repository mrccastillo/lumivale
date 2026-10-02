import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { HomepageReels } from "@/components/homepage-reels";
const reel = { id: "1", title: "Launch reel", clientName: "Client", platform: "Instagram", url: "https://instagram.com/reel/123", thumbnailUrl: "https://res.cloudinary.com/demo/reel.jpg", views: "1.2M", likes: "27K", comments: "", status: "published" as const, sortOrder: 0 };
test("shows portrait, current metrics, and accessible original-platform links", () => {
  render(<HomepageReels reels={[reel]} />);
  expect(screen.getByRole("region", { name: "Campaign reels" })).toBeInTheDocument();
  expect(screen.getByAltText("Launch reel")).toHaveAttribute("src", reel.thumbnailUrl);
  for (const link of screen.getAllByRole("link")) { expect(link).toHaveAttribute("href", reel.url); expect(link).toHaveAttribute("rel", "noopener noreferrer"); expect(link).toHaveAttribute("target", "_blank"); }
  expect(screen.getByText("1.2M")).toBeInTheDocument(); expect(screen.queryByText("comments")).toBeNull();
});
test("empty gallery does not show fictional reels", () => { const { container } = render(<HomepageReels reels={[]} />); expect(container).toBeEmptyDOMElement(); });
