import { act, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ResultCount } from "@/components/result-count";

afterEach(() => vi.unstubAllGlobals());

test("counts when visible and finishes at the exact saved value", () => {
  let intersect: IntersectionObserverCallback;
  let tick: FrameRequestCallback;
  const disconnect = vi.fn();
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { intersect = callback; }
    observe = vi.fn();
    disconnect = disconnect;
  });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { tick = callback; return 1; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const { container, unmount } = render(<ResultCount value="30K+" />);
  const visible = container.querySelectorAll('[aria-hidden="true"]')[1];
  expect(visible.textContent).toBe("30K+");
  act(() => intersect([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver));
  expect(visible.textContent).toBe("0K+");
  act(() => tick(100));
  act(() => tick(900));
  expect(visible.textContent).toBe("26K+");
  act(() => tick(1700));
  expect(visible.textContent).toBe("30K+");
  expect(container.querySelector('.sr-only')?.textContent).toBe("30K+");
  unmount();
  expect(disconnect).toHaveBeenCalled();
  expect(cancelAnimationFrame).toHaveBeenCalled();
});

test("shows the final value without animation for reduced motion", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const observer = vi.fn();
  vi.stubGlobal("IntersectionObserver", observer);
  const { container } = render(<ResultCount value="98.6%" />);
  expect(container.querySelectorAll('[aria-hidden="true"]')[1].textContent).toBe("98.6%");
  expect(observer).not.toHaveBeenCalled();
});
