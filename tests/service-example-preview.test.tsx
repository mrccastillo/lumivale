import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { getExamplePreview } from "@/lib/service-example-preview";
import { ServiceExamplePreview } from "@/components/service-example-preview";

test.each([
  ["https://youtube.com/watch?v=M7lc1UVf-VE", "YouTube"],
  ["https://youtu.be/M7lc1UVf-VE", "YouTube"],
  ["https://www.youtube.com/shorts/M7lc1UVf-VE", "YouTube"],
  ["https://www.youtube.com/embed/M7lc1UVf-VE", "YouTube"],
  ["https://www.tiktok.com/@scout2015/video/6718335390845095173", "TikTok"],
  ["https://www.facebook.com/facebook/videos/10153231379946729/", "Facebook"],
  ["https://www.facebook.com/watch/?v=10153231379946729", "Facebook"],
  ["https://www.facebook.com/facebook/posts/123456789", "Facebook"],
  ["https://www.facebook.com/permalink.php?story_fbid=12345&id=67890", "Facebook"],
])("embeds supported URL %s with its original link", (url, provider) => {
  const preview = getExamplePreview(url);
  expect(preview?.provider).toBe(provider);
  expect(preview?.embedUrl).toBeTruthy();
  const { container } = render(<ServiceExamplePreview card={{ title: "Example", summary: "Proof", tag: "Social", previewUrl: url }} />);
  expect(screen.getByTitle(`${provider} preview: Example`)).toHaveAttribute("loading", "lazy");
  expect(container.querySelector("iframe")).toHaveAttribute("src", preview?.embedUrl);
  expect(screen.getByRole("link")).toHaveAttribute("href", new URL(url).href);
  expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
});

test.each([
  "https://chatgpt.com/share/example", "https://example.com/article", "https://linkedin.com/posts/test",
  "https://vm.tiktok.com/example/", "https://facebook.com/share/v/test/", "https://youtube.com/@channel",
  "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE", "https://youtube.com:8443/watch?v=M7lc1UVf-VE",
])("falls back to a website card for %s", (url) => {
  expect(getExamplePreview(url)?.embedUrl).toBeUndefined();
  const { container } = render(<ServiceExamplePreview card={{ title: "Example", summary: "Proof", tag: "Link", previewUrl: url }} />);
  expect(container.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link")).toHaveAttribute("href", new URL(url).href);
});

test.each(["javascript:alert(1)", "data:text/html,test", "bad-url", "https://user:pass@example.com"]) ("does not render unsafe legacy link %s", (url) => {
  expect(getExamplePreview(url)).toBeNull();
  const { container } = render(<ServiceExamplePreview card={{ title: "Example", summary: "Proof", tag: "Link", previewUrl: url }} />);
  expect(container.querySelector("a, iframe")).toBeNull();
});

test.each(["https://youtu.be/M7lc1UVf-VE", "https://example.com/article"]) ("cover overrides preview and opens destination %s", (url) => {
  const card = { title: "Example", summary: "Proof", tag: "Link", previewUrl: url, imageUrl: "https://example.com/cover.png" };
  const { container, rerender } = render(<ServiceExamplePreview card={card} />);
  expect(container.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link", { name: "Open Example (opens in a new tab)" })).toHaveAttribute("href", new URL(url).href);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("link", { name: /Open original/ })).toBeInTheDocument();
  rerender(<ServiceExamplePreview card={{ ...card, imageUrl: "" }} />);
  expect(container.querySelector("img")).toBeNull();
  expect(Boolean(container.querySelector("iframe"))).toBe(url.includes("youtu.be"));
});

test("standalone photos open full-size and retain captions", () => {
  render(<ServiceExamplePreview card={{ title: "Photo", summary: "Proof", tag: "Photo", exampleType: "photo", imageUrl: "https://example.com/full.png", imageAlt: "Results screenshot" }} />);
  expect(screen.getByRole("link", { name: "Open Photo full-size image (opens in a new tab)" })).toHaveAttribute("href", "https://example.com/full.png");
  expect(screen.getByText("Results screenshot")).toBeInTheDocument();
});
