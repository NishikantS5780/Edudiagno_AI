
import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn("mb-8 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
