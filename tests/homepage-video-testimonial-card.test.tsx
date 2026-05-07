import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { HomepageVideoTestimonialCard } from "@/components/homepage-video-testimonial-card";

describe("homepage video testimonial card", () => {
  test("hides the on-video text overlay while a real video is playing", () => {
    const { container } = render(
      <HomepageVideoTestimonialCard
        testimonial={{
          personName: "Jon Ramos",
          personTitle: "CEO, Signal Labs",
          quote: "The execution support helped us move faster.",
          videoFileId: "video-1",
        }}
      />,
    );

    const video = container.querySelector("video");

    if (!video) {
      throw new Error("Expected video element to render");
    }

    expect(screen.getByText("Jon Ramos")).toBeInTheDocument();
    expect(screen.getByText("CEO, Signal Labs")).toBeInTheDocument();
    expect(screen.queryByText("The execution support helped us move faster.")).not.toBeInTheDocument();

    fireEvent.play(video);

    expect(screen.queryByText("Jon Ramos")).not.toBeInTheDocument();

    fireEvent.pause(video);

    expect(screen.getByText("Jon Ramos")).toBeInTheDocument();

    fireEvent.play(video);
    fireEvent.ended(video);

    expect(screen.getByText("Jon Ramos")).toBeInTheDocument();
  });

  test("keeps placeholder overlay content visible when there is no video file", () => {
    render(
      <HomepageVideoTestimonialCard
        testimonial={{
          personName: "Founder placeholder",
          personTitle: "B2B SaaS team",
          quote: "Placeholder quote",
          videoFileId: "",
          placeholder: true,
        }}
      />,
    );

    expect(screen.getByText("Video placeholder")).toBeInTheDocument();
    expect(screen.getByText("Founder placeholder")).toBeInTheDocument();
    expect(screen.queryByText("Placeholder quote")).not.toBeInTheDocument();
  });
});
