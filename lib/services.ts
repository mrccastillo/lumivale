export type Service = {
  slug: string;
  title: string;
  summary: string;
  highlights: string[];
  description: string;
};

const services: Service[] = [
  {
    slug: "comment-campaign",
    title: "Comment Campaign",
    summary:
      "Join relevant Reddit, Quora, and X conversations to increase awareness and send more interested users back to your site.",
    highlights: [
      "Relevant Reddit, Quora, and X threads",
      "100-140 comments per month or 100 comments plus 8 posts",
      "User awareness and website traffic support",
    ],
    description:
      "Posting targeted comments on relevant Reddit, Quora, and X threads (100-140 comments/mo) or (100 comments + 8 posts/mo) to increase user awareness and website traffic.",
  },
  {
    slug: "ugc-content-creation",
    title: "UGC Content Creation",
    summary:
      "Publish consistent short-form videos on YouTube Shorts and TikTok through brand-specific content accounts.",
    highlights: [
      "30-60 short-form videos per month",
      "YouTube Shorts and TikTok publishing",
      "New brand-specific content accounts",
    ],
    description:
      "Publishing 30-60 short-form videos per month on YouTube Shorts and TikTok to get traction and high performance with US/EU audiences. Content will be posted on new brand-specific accounts.",
  },
  {
    slug: "creator-collabs",
    title: "Creator Collabs",
    summary:
      "Coordinate creator partnerships that place dedicated media content around your brand across key social channels.",
    highlights: [
      "5-10 creator collaboration deals",
      "YouTube, LinkedIn, X, and TikTok coverage",
      "Dedicated media content around your brand",
    ],
    description:
      "Managing and closing 5-10 collaboration deals with creators on YouTube, LinkedIn, X, and TikTok to release dedicated media content surrounding your brand with our creative partners or other creators. You will handle creator payments directly.",
  },
  {
    slug: "linkedin-outreaching",
    title: "LinkedIn Outreaching",
    summary:
      "Manage executive LinkedIn outreach to build targeted connections and create more calls or sign-ups.",
    highlights: [
      "Executive LinkedIn account management",
      "15-20 targeted connections per day",
      "Calls and sign-ups through targeted outreach",
    ],
    description:
      "Managing executive LinkedIn accounts to generate calls and sign-ups through targeted outreach. Establishing 15-20 industry specific connections/day (400+ connections/mo).",
  },
  {
    slug: "email-b2b-campaigns",
    title: "Email B2B Campaigns",
    summary:
      "Launch structured B2B email campaigns with inbox setup, domains, lead generation, and daily sending.",
    highlights: [
      "Multi-inbox email campaign setup",
      "Inbox, domain, and lead generation support",
      "60 emails per day, around 1,000 emails per month",
    ],
    description:
      "Launching a structured email campaign targeting multiple inboxes for direct communication with users. This includes setup of inboxes and domains, lead generation, and sending 60 emails/day (around 1000 emails/mo).",
  },
];

export function getAllServices() {
  return services;
}

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}
