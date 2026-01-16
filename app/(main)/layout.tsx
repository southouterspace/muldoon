import { Header } from "@/components/layout/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="pt-safe pb-safe">
      <Header />
      <main>{children}</main>
    </div>
  );
}
