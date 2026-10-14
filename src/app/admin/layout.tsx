import { AdminLangProvider } from "@/components/admin/AdminLang";
import { getAdminLang } from "@/lib/admin-i18n-server";

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return <AdminLangProvider lang={lang}>{children}</AdminLangProvider>;
}
