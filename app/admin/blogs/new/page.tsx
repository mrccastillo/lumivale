import { redirect } from "next/navigation";

export default async function NewBlogPostPage() {
  redirect("/admin/blogs?mode=create");
}
