import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const dynamic = "force-dynamic";

export default function WebsiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
