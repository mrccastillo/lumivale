import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { TestimonialForm } from "@/app/admin/testimonials/testimonial-form";
import { HomepageTestimonialsCarousel } from "@/components/homepage-testimonials-carousel";
import { uploadTestimonialImage } from "@/app/api/admin/testimonials/upload-image";
import { parseTestimonialFormData } from "@/lib/testimonials";

const upload = vi.hoisted(() => vi.fn().mockResolvedValue("https://example.com/logo.png"));
vi.mock("@/lib/cloudinary", () => ({ uploadMediaToCloudinary: upload }));
afterEach(() => upload.mockClear());
const testimonial = { id: "1", personName: "Client", personTitle: "CEO", quote: "Great work", imageUrl: "https://example.com/logo.png", type: "text" as const, status: "published" as const, sortOrder: 0, videoUrl: "", createdAt: new Date(), updatedAt: new Date() };

describe("testimonial images", () => {
  test("uploads supported images and rejects invalid or oversized files", async () => {
    await expect(uploadTestimonialImage(null)).resolves.toBe("");
    await expect(uploadTestimonialImage(new File(["image"], "logo.png", { type: "image/png" }))).resolves.toBe(testimonial.imageUrl);
    expect(upload).toHaveBeenCalledWith(expect.any(File), { folder: "lumivale/testimonials/images", resourceType: "image" });
    await expect(uploadTestimonialImage(new File(["x"], "bad.svg", { type: "image/svg+xml" }))).rejects.toThrow("JPG, PNG, or WEBP");
    await expect(uploadTestimonialImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", { type: "image/png" }))).rejects.toThrow("5MB");
    expect(upload).toHaveBeenCalledTimes(1);
  });
  test("previews saved images and allows removal", () => {
    render(<TestimonialForm testimonial={testimonial} />);
    expect(screen.getByAltText("Testimonial image preview")).toHaveAttribute("src", testimonial.imageUrl);
    expect(screen.getByLabelText("Logo or photo (optional)")).toHaveAttribute("type", "file");
    fireEvent.click(screen.getByLabelText("Remove saved image"));
    expect(screen.queryByAltText("Testimonial image preview")).not.toBeInTheDocument();
  });
  test("renders an image beside the client details while supporting existing testimonials", () => {
    const { container } = render(<HomepageTestimonialsCarousel testimonials={[testimonial, { ...testimonial, id: "2", imageUrl: undefined }]} />);
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("img")).toHaveAttribute("src", testimonial.imageUrl);
  });
  test("parses the saved image", () => {
    const data = new FormData();
    data.set("imageUrl", testimonial.imageUrl);
    expect(parseTestimonialFormData(data).imageUrl).toBe(testimonial.imageUrl);
  });
});
