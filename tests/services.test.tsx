import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  getAllServices,
  getServiceBySlug,
} from "@/lib/services";
import ServiceDetailPage, {
  generateStaticParams,
} from "@/app/services/[slug]/page";

describe("services data and detail pages", () => {
  test("lists the service offerings from the homepage brief", () => {
    const services = getAllServices();

    expect(services.map((service) => service.title)).toEqual([
      "Comment Campaign",
      "UGC Content Creation",
      "Creator Collabs",
      "LinkedIn Outreaching",
      "Email B2B Campaigns",
    ]);
    expect(services.every((service) => service.slug && service.description)).toBe(true);
    expect(services.every((service) => service.privateContent.pricePreview)).toBe(true);
  });

  test("looks up services by slug", () => {
    const [firstService] = getAllServices();

    expect(getServiceBySlug(firstService.slug)).toEqual(firstService);
    expect(getServiceBySlug("missing-service")).toBeUndefined();
  });

  test("generates static params for every service", async () => {
    const params = await generateStaticParams();

    expect(params).toEqual(
      getAllServices().map((service) => ({ slug: service.slug })),
    );
  });

  test("renders full service details on the detail route", async () => {
    const service = getServiceBySlug("comment-campaign");

    if (!service) {
      throw new Error("Expected seeded comment campaign service");
    }

    const { container } = render(
      await ServiceDetailPage({
        params: Promise.resolve({ slug: service.slug }),
      }),
    );


    expect(
      screen.getByRole("heading", { level: 1, name: service.title }),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-nav-surface="light"]')).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Your questions,/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Have a question?" })).toBeInTheDocument();
    expect(screen.queryByText("Highlights")).not.toBeInTheDocument();
    expect(screen.getByText(service.description)).toBeInTheDocument();
    expect(screen.queryByText("EXAMPLES")).not.toBeInTheDocument();
    service.privateContent.pricingLines.forEach((line) => {
      expect(screen.queryByText(line.value)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("link", { name: "Book a call" })).not.toBeInTheDocument();
  });

  test("rejects unknown service slugs", async () => {
    await expect(
      ServiceDetailPage({
        params: Promise.resolve({ slug: "missing-service" }),
      }),
    ).rejects.toThrow();
  });
});
