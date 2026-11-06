export async function uploadTestimonialMedia(file: File, resourceType: "image" | "video") {
  const types = resourceType === "video"
    ? ["video/mp4", "video/webm", "video/quicktime"]
    : ["image/jpeg", "image/png", "image/webp"];
  const maxMB = resourceType === "video" ? 100 : 5;
  if (!types.includes(file.type)) throw new Error(`Unsupported testimonial ${resourceType} format.`);
  if (file.size > maxMB * 1024 * 1024) throw new Error(`Testimonial ${resourceType} must be ${maxMB}MB or smaller.`);

  const signingResponse = await fetch("/api/admin/testimonials/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceType }),
  });
  if (!signingResponse.ok || signingResponse.redirected) throw new Error("Could not prepare upload. Please refresh and try again.");
  const signed = await signingResponse.json();
  const body = new FormData();
  body.set("file", file);
  body.set("api_key", signed.apiKey);
  body.set("timestamp", String(signed.timestamp));
  body.set("folder", signed.folder);
  body.set("signature", signed.signature);
  const response = await fetch(signed.uploadUrl, { method: "POST", body });
  if (!response.ok) throw new Error(`Could not upload ${resourceType}. Please try again.`);
  const result = await response.json();
  if (typeof result.secure_url !== "string" || !result.secure_url.startsWith("https://")) {
    throw new Error("Upload did not return a secure URL. Please try again.");
  }
  return result.secure_url as string;
}
