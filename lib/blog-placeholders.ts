export type PlaceholderBlogPost = {
  slug: string;
  category: string;
  excerpt: string;
  readTime: string;
  coverAlt?: string; 
  title: string;
  body: string;
};

export const placeholderBlogPosts: PlaceholderBlogPost[] = [
  {
    slug: "comment-campaigns-warmer-inbound-attention",
    category: "Comment Campaigns",
    excerpt:
      "Placeholder article on turning active conversations into steady traffic and awareness.",
    readTime: "4 min read",
    title: "How comment campaigns can create warmer inbound attention.",
    body: `## Why comment campaigns work

Comment campaigns can create warmer inbound attention when your team shows up inside conversations that already have intent, urgency, and context.

## What good execution looks like

The goal is not to post generic replies at scale. The goal is to contribute something specific enough that the right people want to learn more.

### Start with active conversations

Look for threads where your audience is already discussing a problem, comparing tools, or asking for recommendations.

### Add useful context

Respond with something practical, opinionated, or experience-based so the comment feels worth reading on its own.

## A simple weekly workflow

- Build a short list of relevant creators, founders, and communities
- Save discussion prompts that repeatedly attract attention
- Turn high-performing comments into future content angles

Real published articles will appear here once they are available.`,
  },
  {
    slug: "practical-ugc-publishing-cadence",
    category: "UGC Content",
    excerpt:
      "Placeholder article on creator-style short-form content systems for lean distribution.",
    readTime: "6 min read",
    title: "What a practical UGC publishing cadence looks like for early teams.",
    body: `## Why cadence matters

UGC works better when it feels consistent and recognizable, not when it appears in random bursts with no editorial rhythm behind it.

## Build around repeatable formats

A practical cadence starts with a few content formats your team can produce without heavy oversight.

### Keep the workflow light

Use simple briefs, fast review loops, and a small number of content pillars so momentum does not stall.

### Prioritize distribution

Publishing is only one step. Pair each asset with a clear posting rhythm across the channels that already drive attention.

## What a lean weekly rhythm can include

- One customer-proof clip
- One problem-solution explainer
- One founder or operator perspective post

Real published articles will appear here once they are available.`,
  },
  {
    slug: "keeping-outreach-simple-and-consistent",
    category: "Outreach",
    excerpt:
      "Placeholder article on simple outbound systems across LinkedIn and email motions.",
    readTime: "5 min read",
    title: "Keeping outreach simple without losing consistency or intent.",
    body: `## Keep the system simple

Outreach usually breaks when the workflow gets too layered, too customized, or too dependent on perfect conditions.

## What consistency actually requires

Strong outbound execution depends more on follow-through than on complicated sequencing.

### Keep messaging clear

Lead with one problem, one angle, and one reason the recipient should care right now.

### Reduce workflow drag

Remove steps that slow the team down without improving reply quality.

## A practical outbound baseline

- Maintain a narrow ICP
- Track replies and follow-ups in one place
- Review message performance every week

Real published articles will appear here once they are available.`,
  },
];

export function getPlaceholderBlogPostBySlug(slug: string) {
  return placeholderBlogPosts.find((post) => post.slug === slug) ?? null;
}
