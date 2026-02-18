import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="container-page lg:flex lg:items-start lg:gap-6">
      <AdminNav />
      <div className="mt-4 flex-1 lg:mt-0">{children}</div>
    </div>
  );
}
