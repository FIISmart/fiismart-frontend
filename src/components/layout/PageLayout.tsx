import type { ReactNode, ElementType } from "react";

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: "7xl" | "6xl" | "4xl" | "900" | "1280" | "80rem";
  className?: string;
  as?: ElementType;
}

const maxWidthMap: Record<string, string> = {
  "7xl": "max-w-7xl",
  "6xl": "max-w-6xl",
  "4xl": "max-w-4xl",
  "900": "max-w-[900px]",
  "1280": "max-w-[1280px]",
  "80rem": "max-w-[80rem]",
};

export function PageLayout({ children, maxWidth = "7xl", className = "", as: Comp = "main" }: PageLayoutProps) {
  return (
    <Comp className={`${maxWidthMap[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Comp>
  );
}