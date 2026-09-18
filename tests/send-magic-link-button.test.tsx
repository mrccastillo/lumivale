import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { SendMagicLinkButton } from "@/app/admin/trusted-clients/send-magic-link-button";

afterEach(() => vi.unstubAllGlobals());

test("sends in place, prevents repeat clicks while pending, and shows success", async () => {
  let finish!: (value: unknown) => void;
  const fetchMock = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
  vi.stubGlobal("fetch", fetchMock);
  const location = window.location.href;
  render(<SendMagicLinkButton email="client@example.com" />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent("Sending");
  fireEvent.click(button);
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock.mock.calls[0]).toEqual([
    "/api/admin/trusted-clients/send-link", expect.objectContaining({ method: "POST", body: expect.any(FormData) }),
  ]);
  finish({ ok: true, json: async () => ({ mode: "email" }) });
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Magic link sent."));
  expect(button).toBeEnabled();
  expect(window.location.href).toBe(location);
});

test("shows failure in place and permits retry", async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Could not send the magic link. Please try again." }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ mode: "email" }) });
  vi.stubGlobal("fetch", fetchMock);
  render(<SendMagicLinkButton email="client@example.com" />);
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not send"));
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Magic link sent."));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("reports expired admin sessions without navigation", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ redirected: true }));
  render(<SendMagicLinkButton email="client@example.com" />);
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("session has expired"));
});

test("development preview does not falsely claim an email was sent", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ mode: "preview", previewUrl: "http://localhost/client-access/verify?token=test" }) }));
  render(<SendMagicLinkButton email="client@example.com" />);
  fireEvent.click(screen.getByRole("button"));
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Email is not configured"));
  expect(screen.getByRole("link", { name: "Open preview magic link" })).toHaveAttribute("target", "_blank");
});
