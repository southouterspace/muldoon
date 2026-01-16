export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <div className="pt-safe pb-safe">{children}</div>;
}
