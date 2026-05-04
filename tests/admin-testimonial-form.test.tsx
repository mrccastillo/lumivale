import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";

describe("testimonial form", () => {
  test("hides the video upload field in text mode", () => {
    render(<TestimonialForm />);

    expect(screen.getByLabelText("Type")).toHaveValue("text");
    expect(screen.queryByLabelText("Upload video")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Quote")).toBeRequired();
  });

  test("shows the video upload field when switched to video mode", () => {
    render(<TestimonialForm />);

    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "video" } });

    expect(screen.getByLabelText("Upload video")).toHaveAttribute(
      "accept",
      "video/mp4,video/webm,video/quicktime",
    );
    expect(screen.getByLabelText("Quote")).toBeRequired();
  });
});
