import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PageTitleProps {
  title: string;
  description?: string;
  cta?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: ReactNode;
  };
  action?: ReactNode;
}

export function PageTitle({
  title,
  description,
  cta,
  action,
}: PageTitleProps): React.ReactElement {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-xl">{description}</p>
        )}
      </div>
      {action}
      {cta &&
        (cta.href ? (
          <Button asChild size="lg">
            <a href={cta.href}>
              {cta.icon}
              {cta.label}
            </a>
          </Button>
        ) : (
          <Button onClick={cta.onClick} size="lg">
            {cta.icon}
            {cta.label}
          </Button>
        ))}
    </div>
  );
}
