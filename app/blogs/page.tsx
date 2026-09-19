import Link from "next/link";
import { BlogCarousel } from "@/components/blog-carousel";
import { placeholderBlogPosts } from "@/lib/blog-placeholders";
import { getPublicBlogPosts } from "@/lib/blogs";
import { getMongoDb } from "@/lib/mongodb";
import styles from "@/components/public-listing.module.css";

export default async function BlogsPage() {
  const posts = await getBlogsPagePosts();
  const hasPosts = posts.length > 0;
  const displayedPosts = hasPosts ? posts : placeholderBlogPosts;
  return (
    <div className={styles.page} data-nav-surface="light">
      <header className={`${styles.wrap} ${styles.hero}`}>
        <p className={styles.eyebrow}>Lumivale / Journal</p>
        <div className={styles.heroRow}>
          <h1>Blogs<span aria-hidden="true">.</span></h1>
          <p>Gain valuable insight from our team on relevant industry news, emerging trends, and practical marketing strategies to help you stay ahead.</p>
        </div>
      </header>
      <section className={`${styles.wrap} ${styles.journal}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Latest thinking</p>
          <h2>Practical industry insights to accelerate your growth</h2>
        </div>
        <BlogCarousel>
          {displayedPosts.map((post, index) => {
            const image = "coverImageUrl" in post ? post.coverImageUrl : undefined;
            return <Link key={post.slug} href={`/blogs/${post.slug}`} aria-label={`Read ${post.title}`}
              className={`${styles.post} ${index === 0 ? styles.featured : ""}`}>
              <div className={styles.postImage}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image} alt={("coverAlt" in post && post.coverAlt) || post.title} loading={index === 0 ? "eager" : "lazy"} />
                ) : (
                  <div className={styles.postArtwork} aria-label={`${post.category} placeholder image`}>
                    <span className={styles.artLabel}>{hasPosts ? post.category : "Placeholder"}</span>
                    <strong aria-hidden="true">{post.category}</strong>
                    <span className={styles.artFoot} aria-hidden="true">Lumivale / Perspectives <span>&#8599;</span></span>
                  </div>
                )}
              </div>
              <article className={styles.postCopy}>
                <div className={styles.postMeta}><span>{post.category}</span><span>{post.readTime}</span></div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className={styles.textLink}>Read more <span aria-hidden="true">&#8599;</span></span>
              </article>
            </Link>;
          })}
        </BlogCarousel>
      </section>
    </div>
  );
}

async function getBlogsPagePosts() {
  try {
    const db = await getMongoDb();

    return getPublicBlogPosts(db);
  } catch (error) {
    console.error("Unable to load blog posts", error);

    return [];
  }
}
