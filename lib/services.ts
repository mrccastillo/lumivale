export type ServicePricingLine = {
  label: string;
  value: string;
};

export type ServiceExampleCard = {
  title: string;
  summary: string;
  tag: string;
};

export type PrivateServiceContent = {
  exampleCards: ServiceExampleCard[];
  examplePlatform: string;
  heroDescription: string;
  pricePreview: string;
  pricingLines: ServicePricingLine[];
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  highlights: string[];
  description: string;
  privateContent: PrivateServiceContent;
};

const services: Service[] = [
  {
    slug: "comment-campaign",
    title: "Comment Campaign",
    summary:
      "Post targeted comments on relevant Reddit, Quora, and X threads to build awareness and bring more interested users back to your site.",
    highlights: [
      "Relevant Reddit, Quora, and X conversations",
      "100 comments + 8 posts or 200 comments + 20 posts",
      "User awareness and website traffic support",
    ],
    description:
      "Posting targeted comments on relevant Reddit, Quora, and X threads (100-140 comments/mo) or (100 comments + 8 posts/mo) to increase user awareness and website traffic (SEO).",
    privateContent: {
      examplePlatform: "Reddit",
      heroDescription:
        "Posting targeted comments on relevant Reddit, Quora, and X threads (100-140 comments/mo) or (100 comments + 8 posts/mo) to increase user awareness and website traffic (SEO).",
      pricePreview: "Starting at $850/mo",
      pricingLines: [
        { label: "Monthly rate for 100 comments + 8 posts", value: "$850" },
        { label: "Monthly rate for 200 comments + 20 posts", value: "$1450" },
      ],
      exampleCards: [
        {
          title: "Reddit thread reply",
          summary: "Answer product-relevant questions with a clear CTA back to the site.",
          tag: "Awareness",
        },
        {
          title: "Quora answer placement",
          summary: "Publish useful long-form responses in intent-rich category threads.",
          tag: "Traffic",
        },
        {
          title: "X conversation post",
          summary: "Enter live industry conversations with comments that feel native.",
          tag: "Social proof",
        },
      ],
    },
  },
  {
    slug: "ugc-content-creation",
    title: "UGC Content Creation",
    summary:
      "Publish 30-60 short-form videos each month on YouTube Shorts and TikTok through brand-specific content accounts.",
    highlights: [
      "30-60 short-form videos per month",
      "YouTube Shorts and TikTok publishing",
      "Brand-specific content accounts for distribution",
    ],
    description:
      "Publishing 30-60 short-form videos per month on YouTube Shorts and Tiktok to get traction and high performance with US/EU audiences. Content will be posted on new brand-specific accounts.",
    privateContent: {
      examplePlatform: "TikTok",
      heroDescription:
        "Publishing 30-60 short-form videos per month on Youtube Shorts and Tiktok to get traction and high performance with US/EU audiences. Content will be posted on new brand-specific accounts.",
      pricePreview: "Starting at $850/mo",
      pricingLines: [
        { label: "Monthly rate for 30 contents", value: "$850" },
        { label: "Monthly rate for 60 contents", value: "$1450" },
      ],
      exampleCards: [
        {
          title: "Hook-first TikTok",
          summary: "Quick opener, native pacing, and product angle tuned for retention.",
          tag: "UGC",
        },
        {
          title: "Shorts repost system",
          summary: "Reuse the winning concept across YouTube Shorts and TikTok safely.",
          tag: "Distribution",
        },
        {
          title: "Creator-style screen demo",
          summary: "Blend product footage with casual narration for a less polished look.",
          tag: "Testing",
        },
      ],
    },
  },
  {
    slug: "creator-collabs",
    title: "Creator Collabs",
    summary:
      "Manage 5-10 creator collaboration deals across YouTube, LinkedIn, X, and TikTok to release dedicated content around your brand.",
    highlights: [
      "5-10 creator collaboration deals",
      "YouTube, LinkedIn, X, and TikTok coverage",
      "Client handles creator payments directly",
    ],
    description:
      "Managing and closing 5-10 collaboration deals with creators on YouTube, LinkedIn, X, and TikTok to release dedicated media content surrounding your brand with our creative partners or other creators. You will handle creator payments directly.",
    privateContent: {
      examplePlatform: "TikTok",
      heroDescription:
        "Managing and closing 5-10 collaboration deals with creators on YouTube, LinkedIn, X, and TikTok to release dedicated media content surrounding your brand with our creative partners or other creators. You will handle creator payments directly.",
      pricePreview: "$850/mo + creator fees",
      pricingLines: [
        { label: "Monthly rate", value: "$850" },
        {
          label: "Creator's payment",
          value: "$1,000-$4,000 for total of 5-10 deals",
        },
      ],
      exampleCards: [
        {
          title: "Creator shortlist",
          summary: "Match channels and audience fit before sending any outreach.",
          tag: "Sourcing",
        },
        {
          title: "Deal coordination",
          summary: "Handle messaging, negotiation, and posting windows for launch timing.",
          tag: "Execution",
        },
        {
          title: "Content delivery",
          summary: "Ensure every creator piece lands with the right angle and brand mention.",
          tag: "Publishing",
        },
      ],
    },
  },
  {
    slug: "linkedin-outreaching",
    title: "LinkedIn Outreaching",
    summary:
      "Manage executive LinkedIn accounts to create more calls and sign-ups through targeted outreach.",
    highlights: [
      "Executive LinkedIn account management",
      "15-20 industry-specific connections per day",
      "400+ targeted connections each month",
    ],
    description:
      "Managing executive LinkedIn accounts to generate calls and sign-ups through targeted outreach. Establishing 15-20 industry specific connections/day (400+ connections/mo).",
    privateContent: {
      examplePlatform: "LinkedIn",
      heroDescription:
        "Managing executive LinkedIn accounts to generate calls and sign-ups through targeted outreach. Establishing 15-20 industry specific connections/day (400+ connections/mo).",
      pricePreview: "$850/mo",
      pricingLines: [{ label: "Monthly rate", value: "$850" }],
      exampleCards: [
        {
          title: "Connection targeting",
          summary: "Build a repeatable targeting list around role, niche, and buying intent.",
          tag: "Prospecting",
        },
        {
          title: "Message sequencing",
          summary: "Keep outreach simple, conversational, and positioned for replies.",
          tag: "Messaging",
        },
        {
          title: "Lead handoff",
          summary: "Surface warm replies into your call booking or sign-up flow quickly.",
          tag: "Pipeline",
        },
      ],
    },
  },
  {
    slug: "email-b2b-campaigns",
    title: "Email B2B Campaigns",
    summary:
      "Launch a structured B2B email campaign with inbox setup, domains, lead generation, and 60 emails per day.",
    highlights: [
      "Inbox and domain setup for campaign sending",
      "Lead generation and list preparation",
      "60 emails per day, around 1,000 emails per month",
    ],
    description:
      "Launching a structured email campaign targeting multiple inboxes for direct communication with users. This includes setup of inboxes and domains, lead generation, and sending 60 emails/day (around 1000 emails/mo).",
    privateContent: {
      examplePlatform: "Email",
      heroDescription:
        "Launching a structured email campaign targeting multiple inboxes for direct communication with users. This includes setup of inboxes and domains, lead generation, and sending 60 emails/day (around 1000 emails/mo).",
      pricePreview: "$1000/mo",
      pricingLines: [{ label: "Monthly rate", value: "$1000" }],
      exampleCards: [
        {
          title: "Inbox setup",
          summary: "Prepare domains and inboxes so the campaign can start with a clean base.",
          tag: "Setup",
        },
        {
          title: "Lead list building",
          summary: "Source targeted contacts before the first outreach sequence goes live.",
          tag: "Leads",
        },
        {
          title: "Outbound cadence",
          summary: "Send controlled daily volume with message variants for reply testing.",
          tag: "Sending",
        },
      ],
    },
  },
];

export function getAllServices() {
  return services;
}

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
