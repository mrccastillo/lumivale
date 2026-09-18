import type { ReactNode } from "react";

import { AdminWorkspace } from "@/app/admin/admin-workspace";
import { getSiteContentForSite } from "@/lib/site-content";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const content = await getSiteContentForSite();
  return <AdminWorkspace content={content}>{children}</AdminWorkspace>;
}
