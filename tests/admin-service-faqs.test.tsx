import { fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ServiceForm } from "@/app/admin/services/service-form";
import { getDefaultServices } from "@/lib/services";

afterEach(() => vi.unstubAllGlobals());
test("FAQ editor validates in place, reorders and removes stable rows, and saves", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ url: "/admin/services/example/edit" });
  vi.stubGlobal("fetch", fetchMock);
  const { unmount } = render(<ServiceForm cancelHref="/admin/services" />);
    for (const name of ["title", "summary", "description", "highlights", "pricePreview", "heroDescription", "pricingLines"]) {
      fireEvent.change(document.querySelector(`[name="${name}"]`)!, { target: { value: name === "pricingLines" ? "Monthly rate | $850" : "Service content" } });
    }
    fireEvent.click(screen.getByRole("tab", { name: /FAQs$/ }));
  fireEvent.click(screen.getByRole("button", { name: "Add FAQ" }));
  fireEvent.change(screen.getByLabelText("Question"), { target: { value: " " } });
  fireEvent.submit(screen.getByRole("button", { name: "Create service" }).closest("form")!);
  expect(screen.getByText("Enter a question.")).toBeInTheDocument();
  expect(fetchMock).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Question"), { target: { value: "First?" } });
  fireEvent.change(screen.getByLabelText("Answer"), { target: { value: "First answer" } });
  fireEvent.click(screen.getByRole("button", { name: "Add FAQ" }));
  const second = within(screen.getByRole("group", { name: "FAQ 2" }));
  fireEvent.change(second.getByLabelText("Question"), { target: { value: "Second?" } });
  fireEvent.change(second.getByLabelText("Answer"), { target: { value: "Second answer" } });
  expect(second.getByRole("button", { name: "Move down" })).toBeDisabled();
  fireEvent.click(second.getByRole("button", { name: "Move up" }));
  expect(within(screen.getByRole("group", { name: "FAQ 1" })).getByLabelText("Question")).toHaveValue("Second?");
  expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/admin/services");
  fireEvent.submit(screen.getByRole("button", { name: "Create service" }).closest("form")!);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  const saved = JSON.parse(String((fetchMock.mock.calls[0][1].body as FormData).get("serviceFaqs")));
  expect(saved.map((faq: { question: string }) => faq.question)).toEqual(["Second?", "First?"]);
  unmount();
  render(<ServiceForm service={{ ...getDefaultServices()[0], faqs: saved }} />);
    fireEvent.click(screen.getByRole("tab", { name: /FAQs$/ }));
  expect(screen.getAllByLabelText("Question").map(input => (input as HTMLInputElement).value)).toEqual(["Second?", "First?"]);
  for (const button of screen.getAllByRole("button", { name: "Remove FAQ" })) fireEvent.click(button);
  fireEvent.submit(screen.getByRole("button", { name: "Save service" }).closest("form")!);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect((fetchMock.mock.calls[1][1].body as FormData).get("serviceFaqs")).toBe("[]");
});


test("tabs retain edits and reveal a hidden invalid field before saving", async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  render(<ServiceForm service={getDefaultServices()[0]} />);
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated service" } });
  fireEvent.keyDown(screen.getByRole("tab", { name: /Overview$/ }), { key: "End" });
  expect(screen.getByRole("tab", { name: /Examples$/ })).toHaveFocus();
  expect(screen.getByRole("tabpanel", { name: /Examples/ })).toHaveAttribute("id", "service-panel-examples");
  fireEvent.click(screen.getByRole("tab", { name: /Overview$/ }));
  expect(screen.getByLabelText("Title")).toHaveValue("Updated service");
  fireEvent.click(screen.getByRole("tab", { name: /Private pricing$/ }));
  fireEvent.change(screen.getByLabelText("Price preview"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("tab", { name: /Overview$/ }));
  fireEvent.submit(screen.getByRole("button", { name: "Save service" }).closest("form")!);
  expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "service-panel-pricing");
  await waitFor(() => expect(screen.getByLabelText("Price preview")).toHaveFocus());
  expect(fetchMock).not.toHaveBeenCalled();
});
