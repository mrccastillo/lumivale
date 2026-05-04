import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { BlogForm } from "@/app/admin/blogs/blog-form";

const existingPost = {
  id: "post-1",
  slug: "rich-editor",
  category: "Growth",
  title: "Rich Editor",
  excerpt: "A post with rich formatting.",
  body: "## Existing section\n\nIntro copy.",
  readTime: "4 min read",
  tags: ["growth"],
  seoTitle: "",
  seoDescription: "",
  status: "draft" as const,
  coverImageId: "",
  coverAlt: "",
  createdAt: new Date("2026-05-03T08:00:00.000Z"),
  updatedAt: new Date("2026-05-03T08:00:00.000Z"),
};

describe("admin blog editor", () => {
  test("renders the blog editor sections, toolbar, and preview layout", () => {
    render(<BlogForm post={existingPost} />);

    expect(screen.getByText("Blog Link Ending")).toBeInTheDocument();
    expect(screen.getByText("Short Summary")).toBeInTheDocument();
    expect(screen.getByText("Body Content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Heading 1" })).toHaveTextContent("<h1>");
    expect(screen.getByRole("button", { name: "Heading 2" })).toHaveTextContent("<h2>");
    expect(screen.getByRole("button", { name: "Heading 3" })).toHaveTextContent("<h3>");
    expect(screen.getByRole("button", { name: "HTML" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bulleted list" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unset link" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Code block" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Image" }).querySelector("svg")).not.toBeNull();
    expect(screen.getByLabelText("Insert image between sections")).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp,image/gif",
    );
    expect(
      screen.getByText(
        "Use the editor toolbar to format the article, upload inline images, or switch to HTML mode for direct markup editing.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Rich Editor")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Blog preview" })).getByText(
        "A post with rich formatting.",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Blog preview" })).getByText(
        "/blog/rich-editor",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Blog preview" })).getByRole(
        "heading",
        { level: 2, name: "Existing section" },
      ),
    ).toBeInTheDocument();
  });

  test("html mode updates the submitted body content and preview", async () => {
    const { container } = render(<BlogForm />);

    fireEvent.click(screen.getByRole("button", { name: "HTML" }));

    const htmlEditor = screen.getByRole("textbox", { name: "HTML editor" });
    fireEvent.change(htmlEditor, {
      target: { value: "<h1>Launch notes</h1><p>Body paragraph.</p>" },
    });

    const bodyField = container.querySelector('textarea[name="body"]');

    expect(bodyField).toHaveValue("# Launch notes\n\nBody paragraph.");
    await waitFor(() => {
      expect(
        within(screen.getByRole("region", { name: "Blog preview" })).getByRole(
          "heading",
          { level: 1, name: "Launch notes" },
        ),
      ).toBeInTheDocument();
    });
  });

  test("shows formatted blog content in the visual editor by default", () => {
    render(<BlogForm post={existingPost} />);

    const visualEditor = screen.getByRole("textbox", { name: "Visual blog editor" });

    expect(visualEditor).toHaveTextContent("Existing section");
    expect(visualEditor.querySelector("h2")).not.toBeNull();
  });

  test("publish controls stay sticky and use the active Lumivale theme", () => {
    render(<BlogForm />);

    const controls = screen.getByRole("complementary", {
      name: "Publishing and media controls",
    });
    const submit = screen.getByRole("button", { name: "Create Blog Post" });

    expect(controls).toHaveClass("lg:sticky", "lg:top-28");
    expect(submit.className).toContain("var(--lumivale-accent)");
  });
});
