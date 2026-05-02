export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  readTime: string;
};

const blogPosts: BlogPost[] = [
  {
    slug: "comment-campaigns-create-early-awareness",
    category: "Comment Campaigns",
    title: "How comment campaigns create early awareness",
    excerpt:
      "Targeted comments on Reddit, Quora, and X can help a young brand show up where users are already asking questions.",
    body:
      "Comment campaigns work best when they are focused on relevant conversations, clear talking points, and consistent participation across the channels where buyers already ask questions.",
    readTime: "6 min read",
  },
  {
    slug: "short-form-content-needs-consistent-output",
    category: "UGC Content",
    title: "Why short-form content needs consistent output",
    excerpt:
      "Publishing across YouTube Shorts and TikTok gives teams more shots at traction with content built for the right audience.",
    body:
      "Short-form content compounds through volume, testing, and audience fit. A clear monthly cadence helps teams learn what hooks, formats, and angles can turn attention into repeatable growth activity.",
    readTime: "8 min read",
  },
  {
    slug: "direct-outreach-easier-to-repeat",
    category: "Outbound",
    title: "What makes direct outreach easier to repeat",
    excerpt:
      "LinkedIn and email work better when inbox setup, targeting, daily volume, and follow-up stay organized.",
    body:
      "Direct outreach becomes easier to repeat when targeting, inbox setup, daily activity, and follow-up logic are organized before campaigns start sending at volume.",
    readTime: "5 min read",
  },
];

export function getAllBlogPosts() {
  return blogPosts;
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
