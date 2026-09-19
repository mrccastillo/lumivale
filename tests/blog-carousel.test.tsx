import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { BlogCarousel } from "@/components/blog-carousel";

afterEach(() => vi.unstubAllGlobals());

test("keeps the first article outside the carousel and navigates remaining cards", () => {
  let resize: () => void;
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  render(<BlogCarousel>{[1,2,3,4,5].map(i => <a key={i} href={`/blogs/${i}`}>Blog {i}</a>)}</BlogCarousel>);
  const region = screen.getByRole("region", { name: "More articles" });
  expect(within(region).queryByText("Blog 1")).toBeNull();
  expect(within(region).getAllByRole("link")).toHaveLength(4);
  const track = screen.getByLabelText("Blog slides");
  Object.defineProperty(track, "clientWidth", { configurable: true, value: 632 });
  Array.from(track.children).forEach((item, i) => {
    Object.defineProperty(item, "offsetWidth", { value: 300 });
    Object.defineProperty(item, "offsetLeft", { value: i * 332 });
  });
  const scrollTo = vi.fn();
  track.scrollTo = scrollTo;
  act(() => resize());
  fireEvent.click(screen.getByRole("button", { name: "Next articles" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 664, behavior: "smooth" });
  track.scrollLeft = 664;
  fireEvent.scroll(track);
  expect(screen.getByRole("status")).toHaveTextContent("Articles 3–4 of 4");
  fireEvent.click(screen.getByRole("button", { name: "Next articles" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
  Object.defineProperty(track, "clientWidth", { value: 300 });
  act(() => resize());
  expect(screen.getByRole("status")).toHaveTextContent("Articles 3 of 4");
});
