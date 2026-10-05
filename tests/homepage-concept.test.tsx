import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { HomepageFooter } from "@/components/homepage-footer";
import { HomepageCaseStudies } from "@/components/homepage-case-studies";
import { AppShellClient } from "@/components/app-shell-client";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { defaultCaseStudies } from "@/lib/case-studies";

const pathname = vi.hoisted(() => vi.fn(() => "/"));
vi.mock("next/navigation", () => ({ usePathname: pathname }));

test("preserves all editable footer content and destinations", () => {
  const content = { ...defaultSiteContent, footerBrandName: "Custom brand", footerCtaPrompt: "Custom prompt", footerCtaHeading: "A custom closing heading", footerCtaButtonText: "Meet us", footerCtaButtonUrl: "https://example.com/book", footerTagline: "Complete tagline", footerHomeLabel: "Explore", footerHomeUrl: "/explore", footerAboutLabel: "Our team", footerAboutUrl: "/team", footerBlogsLabel: "Journal", footerBlogsUrl: "/journal", footerContactHeading: "Say hello", footerEmail: "hello@example.com", footerLinkedinUrl: "https://linkedin.com/company/example", footerSiteLabel: "example.com", footerBottomText: "Full footer message" };
  const { container } = render(<HomepageFooter content={content} />);
  for (const key of ["footerBrandName", "footerCtaHeading", "footerTagline", "footerContactHeading", "footerSiteLabel", "footerBottomText"] as const) expect(container).toHaveTextContent(content[key]);
  for (const [label, href] of [[content.footerCtaButtonText, content.footerCtaButtonUrl], [content.footerHomeLabel, content.footerHomeUrl], [content.footerAboutLabel, content.footerAboutUrl], [content.footerBlogsLabel, content.footerBlogsUrl], [content.footerEmail, `mailto:${content.footerEmail}`], ["LinkedIn", content.footerLinkedinUrl]]) expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
  expect(container.querySelectorAll("footer")).toHaveLength(1);
  expect(screen.getAllByRole("link")).toHaveLength(6);
  expect(screen.queryByRole("link", { name: "Admin login" })).toBeNull();
  expect(screen.queryByText("Brand & components")).toBeNull();
});

test("changes footer selection only for home and preserves route transitions", () => {
  const shell = () => <AppShellClient navbar={<header>Navigation</header>} footer={<footer>Legacy footer</footer>}><p>Page content</p></AppShellClient>;
  pathname.mockReturnValue("/");
  const { rerender } = render(shell());
  expect(screen.queryByText("Legacy footer")).toBeNull();
  expect(screen.getByText("Navigation")).toBeInTheDocument();
  for (const route of ["/about", "/services/community", "/case-studies/example", "/blogs", "/pricing"]) {
    pathname.mockReturnValue(route); rerender(shell());
    expect(screen.getByText("Legacy footer")).toBeInTheDocument();
  }
  pathname.mockReturnValue("/admin"); rerender(shell());
  expect(screen.queryByText("Legacy footer")).toBeNull();
  expect(screen.queryByText("Navigation")).toBeNull();
  pathname.mockReturnValue("/"); rerender(shell());
  expect(screen.queryByText("Legacy footer")).toBeNull();
});

test("renders compact client identities and all metrics with safe media and story links", () => {
  const studies = [
    { ...defaultCaseStudies[0], slug: "cover", cover: { url: "https://res.cloudinary.com/demo/image/upload/cover.jpg", alt: "Campaign screenshot" } },
    { ...defaultCaseStudies[1], slug: "missing", cover: undefined },
    { ...defaultCaseStudies[2], slug: "unsafe", cover: { url: "javascript:alert(1)", alt: "Unsafe" } },
  ];
  const { container } = render(<HomepageCaseStudies caseStudies={studies} />);
  expect(screen.getByAltText("Campaign screenshot")).toHaveAttribute("src", "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_160,c_limit/cover.jpg");
  expect(container.querySelectorAll("img")).toHaveLength(1);
  expect(container.querySelectorAll("article")).toHaveLength(3);
  for (const study of studies) {
    for (const value of [study.title, study.category, ...study.metrics.flatMap(m => [m.value, m.label])]) expect(container).toHaveTextContent(value);
    expect(screen.getByRole("link", { name: `Read the full story: ${study.title}` })).toHaveAttribute("href", `/case-studies/${study.slug}`);
  }
});

test("shows every study in a grid with safe client logos and no collection link", () => {
  const studies = [
    { ...defaultCaseStudies[0], clientName: "Example Client", logo: { url: "https://res.cloudinary.com/demo/logo.svg", alt: "Example Client logo" }, cover: { url: "https://example.com/cover.jpg", alt: "Unused cover" } },
    { ...defaultCaseStudies[1], logo: { url: "javascript:alert(1)", alt: "Unsafe logo" }, cover: undefined },
  ];
  const { container } = render(<HomepageCaseStudies caseStudies={studies} />);
  expect(screen.getByAltText("Example Client logo")).toHaveAttribute("src", "https://res.cloudinary.com/demo/logo.svg");
  expect(screen.queryByAltText("Unused cover")).toBeNull();
  expect(screen.queryByAltText("Unsafe logo")).toBeNull();
  expect(screen.getByText("Example Client")).toBeVisible();
  expect(container.querySelectorAll("article")).toHaveLength(2);
  expect(container.querySelectorAll("[data-case-study-metric]")).toHaveLength(studies.reduce((count, study) => count + study.metrics.length, 0));
  expect(screen.queryByRole("region", { name: "Case studies" })).toBeNull();
  expect(screen.queryByRole("link", { name: "View all case studies" })).not.toBeInTheDocument();
});


test("footer renders editable link collections and respects empty lists", () => {
  const { rerender } = render(<HomepageFooter content={{ ...defaultSiteContent, footerNavigationLinks: [{ label: "Our work", url: "/case-studies" }], footerSocialLinks: [{ label: "Instagram", url: "https://instagram.com/example" }, { label: "X", url: "https://x.com/example" }] }} />);
  expect(screen.getByRole("link", { name: "Our work" })).toHaveAttribute("href", "/case-studies");
  expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", "https://instagram.com/example");
  expect(screen.queryByRole("link", { name: "LinkedIn" })).not.toBeInTheDocument();
  rerender(<HomepageFooter content={{ ...defaultSiteContent, footerNavigationLinks: [], footerSocialLinks: [] }} />);
  expect(screen.queryByRole("navigation", { name: "Footer" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
});
