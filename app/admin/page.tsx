import type { Metadata } from "next";
import { AdminPortal } from "@/components/admin-portal";

export const metadata: Metadata = {
  title: "Lead portal | Apex Living",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPortal />;
}
