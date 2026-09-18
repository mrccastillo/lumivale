import type { PrivateServiceContent, ServiceExampleCard } from "@/lib/services";

export type ExamplePlatform = { id: string; name: string };
export type PlatformExample = ServiceExampleCard & { id: string; platformId: string };
const validId = /^[a-zA-Z0-9_-]{1,100}$/;

export function validateExamplePlatforms(platforms: ExamplePlatform[], cards: ServiceExampleCard[]) {
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const platform of platforms) {
    if (!validId.test(platform.id) || ids.has(platform.id)) throw new Error("Platform IDs must be unique and valid.");
    const name = platform.name.trim().toLowerCase();
    if (!name || platform.name.trim().length > 60) throw new Error("Platform names must contain 1 to 60 characters.");
    if (names.has(name)) throw new Error("Platform names must be unique within this service.");
    ids.add(platform.id); names.add(name);
  }
  const cardIds = new Set<string>();
  for (const card of cards) {
    if (!card.id || !validId.test(card.id) || cardIds.has(card.id)) throw new Error("Example IDs must be unique and valid.");
    if (!card.platformId || !ids.has(card.platformId)) throw new Error("Every example must belong to a platform in this service.");
    cardIds.add(card.id);
  }
}

export function normalizeExamplePlatforms(content: PrivateServiceContent) {
  if (content.examplePlatforms !== undefined) {
    const platforms = content.examplePlatforms.map((platform) => ({ ...platform, name: platform.name.trim() }));
    validateExamplePlatforms(platforms, content.exampleCards);
    return { ...content, examplePlatforms: platforms, exampleCards: content.exampleCards as PlatformExample[] };
  }
  const names = [...new Map((content.examplePlatform ?? "").split("|").map((name) => name.trim()).filter(Boolean).map((name) => [name.toLowerCase(), name])).values()];
  const platforms = names.map((name, index) => ({ id: `legacy-platform-${index}`, name }));
  const originalCount = platforms.length;
  const cards = content.exampleCards.map((card, index) => {
    let platform = originalCount === 1 ? platforms[0] : platforms.find((item) => item.name.toLowerCase() === card.tag.trim().toLowerCase());
    if (!platform) {
      platform = platforms.find((item) => item.name.toLowerCase() === "general");
      if (!platform) { platform = { id: "legacy-general", name: "General" }; platforms.push(platform); }
    }
    return { ...card, id: `legacy-example-${index}`, platformId: platform.id };
  });
  return { ...content, examplePlatforms: platforms, exampleCards: cards };
}

export function parseExampleManifest(value: FormDataEntryValue) {
  let data: unknown;
  try { data = JSON.parse(String(value)); } catch { throw new Error("Example platform data is invalid. Reload and try again."); }
  if (!data || typeof data !== "object" || !("platforms" in data) || !("examples" in data) || !Array.isArray(data.platforms) || !Array.isArray(data.examples)) {
    throw new Error("Example platform data must include platforms and examples.");
  }
  const platforms: ExamplePlatform[] = data.platforms.map((item: unknown) => {
    if (!item || typeof item !== "object" || !("id" in item) || !("name" in item) || typeof item.id !== "string" || typeof item.name !== "string") throw new Error("Invalid platform.");
    return { id: item.id, name: item.name.trim() };
  });
  const examples: PlatformExample[] = data.examples.map((item: unknown) => {
    if (!item || typeof item !== "object") throw new Error("Invalid example.");
    const record = item as Record<string, unknown>;
    for (const key of ["id", "platformId", "title", "tag", "summary"]) {
      if (typeof record[key] !== "string" || !record[key].trim()) throw new Error("Examples require a platform, title, tag, and description.");
    }
    if (record.exampleType !== "photo" && record.exampleType !== "link") throw new Error("Choose a valid example type.");
    for (const key of ["imageUrl", "imageAlt", "previewUrl", "videoUrl", "videoDescription"]) {
      if (record[key] !== undefined && typeof record[key] !== "string") throw new Error("Invalid example media field.");
    }
    return { ...record } as PlatformExample;
  });
  validateExamplePlatforms(platforms, examples);
  return { platforms, examples };
}
