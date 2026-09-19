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
  for (const key of ["footerBrandName", "footerCtaPrompt", "footerCtaHeading", "footerTagline", "footerContactHeading", "footerSiteLabel", "footerBottomText"] as const) expect(container).toHaveTextContent(content[key]);
  for (const [label, href] of [[content.footerCtaButtonText, content.footerCtaButtonUrl], [content.footerHomeLabel, content.footerHomeUrl], [content.footerAboutLabel, content.footerAboutUrl], [content.footerBlogsLabel, content.footerBlogsUrl], [content.footerEmail, `mailto:${content.footerEmail}`], ["LinkedIn", content.footerLinkedinUrl]]) expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
  expect(container.querySelectorAll("footer")).toHaveLength(1);
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

test("retains complete study content with covers and absent or unsafe media", () => {
  const studies = [
    { ...defaultCaseStudies[0], slug: "cover", cover: { url: "https://res.cloudinary.com/demo/image/upload/cover.jpg", alt: "Campaign screenshot" } },
    { ...defaultCaseStudies[1], slug: "missing", cover: undefined },
    { ...defaultCaseStudies[2], slug: "unsafe", cover: { url: "javascript:alert(1)", alt: "Unsafe" } },
  ];
  const { container } = render(<HomepageCaseStudies caseStudies={studies} />);
  expect(screen.getByAltText("Campaign screenshot")).toHaveAttribute("src", "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1000,c_limit/cover.jpg");
  expect(container.querySelectorAll("img")).toHaveLength(1);
  expect(container.querySelectorAll("article")).toHaveLength(3);
  for (const study of studies) {
    for (const value of [study.title, study.category, study.headline, study.summary, ...study.metrics.flatMap(m => [m.value, m.label])]) expect(container).toHaveTextContent(value);
    expect(screen.getByRole("link", { name: `Read the full story: ${study.title}` })).toHaveAttribute("href", `/case-studies/${study.slug}`);
  }
});
