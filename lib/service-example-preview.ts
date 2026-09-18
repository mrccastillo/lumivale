export function safeExampleUrl(value?: string): URL | null {
  try {
    const url = new URL(value ?? "");
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

export type ExamplePreview = {
  href: string;
  host: string;
  provider: string;
  embedUrl?: string;
  portrait?: boolean;
};

export function getExamplePreview(value?: string): ExamplePreview | null {
  const url = safeExampleUrl(value);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const preview: ExamplePreview = { href: url.href, host, provider: "Website" };
  // A custom port is a website destination, never a recognized provider embed.
  if (url.port) return preview;
  if (["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host)) {
    preview.provider = "YouTube";
    const id = host === "youtu.be"
      ? url.pathname.match(/^\/([\w-]{11})\/?$/)?.[1]
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})\/?$/)?.[1];
    if (id && /^[\w-]{11}$/.test(id)) {
      preview.embedUrl = `https://www.youtube.com/embed/${id}?autoplay=0&controls=1`;
    }
  } else if (["tiktok.com", "m.tiktok.com"].includes(host)) {
    preview.provider = "TikTok";
    const id = url.pathname.match(/^\/@[^/]+\/video\/(\d+)\/?$/)?.[1];
    if (id) {
      preview.embedUrl = `https://www.tiktok.com/player/v1/${id}?autoplay=0&controls=1`;
      preview.portrait = true;
    }
  } else if (["facebook.com", "m.facebook.com", "web.facebook.com"].includes(host)) {
    preview.provider = "Facebook";
    const video = /^\/[^/]+\/videos\/\d+\/?$/.test(url.pathname)
      || (url.pathname === "/watch/" || url.pathname === "/watch" || url.pathname === "/video.php") && /^\d+$/.test(url.searchParams.get("v") ?? "");
    const post = /^\/[^/]+\/posts\/[\w]+\/?$/.test(url.pathname)
      || ["/permalink.php", "/story.php"].includes(url.pathname)
        && /^[\w]+$/.test(url.searchParams.get("story_fbid") ?? "") && /^\d+$/.test(url.searchParams.get("id") ?? "");
    if (video || post) {
      const canonical = new URL(url.pathname, "https://www.facebook.com");
      for (const key of ["v", "story_fbid", "id"]) {
        const value = url.searchParams.get(key);
        if (value) canonical.searchParams.set(key, value);
      }
      const params = new URLSearchParams({ href: canonical.href, width: "350", show_text: "true", autoplay: "false" });
      preview.embedUrl = `https://www.facebook.com/plugins/${video ? "video" : "post"}.php?${params}`;
      preview.portrait = !video;
    }
  }
  return preview;
}
