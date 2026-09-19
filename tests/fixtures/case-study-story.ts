import { asStoryInput, newSection, paragraph } from "@/lib/case-study-story";
import { defaultCaseStudies } from "@/lib/case-studies";
export const image = {
  url: "https://res.cloudinary.com/demo/image/upload/proof.png",
  alt: "Campaign evidence",
  caption: "Campaign report",
  width: 900,
  height: 600,
};
export function fullStory() {
  const input = asStoryInput(defaultCaseStudies[0]);
  input.slug = "new-story";
  input.sections = [
    {
      ...newSection("narrative", "text"),
      type: "narrative" as const,
      heading: "The campaign",
      body: paragraph("Our campaign story"),
    },
    {
      id: "split-left",
      type: "imageText" as const,
      heading: "Our approach",
      body: paragraph("Supporting context"),
      side: "left" as const,
      image,
    },
    {
      id: "split-right",
      type: "imageText" as const,
      heading: "The outcome",
      body: paragraph("Outcome context"),
      side: "right" as const,
      image,
    },
    {
      id: "proof",
      type: "image" as const,
      heading: "Evidence",
      image,
      sourceUrl: "https://example.com/post",
    },
    {
      id: "gallery",
      type: "gallery" as const,
      heading: "Campaign images",
      images: [{ ...image, id: "gallery-1" }],
    },
    {
      id: "comparison",
      type: "comparison" as const,
      heading: "What changed",
      beforeLabel: "Before",
      afterLabel: "After",
      before: paragraph("Before content"),
      after: paragraph("After content"),
    },
    {
      id: "quote",
      type: "quote" as const,
      quote: "A useful campaign",
      personName: "Client Name",
      role: "Founder",
      image,
    },
  ];
  input.cover = image;
  input.cta = {
    heading: "Start a campaign",
    text: "Tell us your goals",
    buttonText: "Contact us",
    buttonUrl: "/contact",
  };
  return input;
}
