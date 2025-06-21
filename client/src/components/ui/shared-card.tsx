import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SharedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function SharedCard({ 
  children, 
  className, 
  hover = false, 
  onClick 
}: SharedCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl shadow-md p-4 bg-white",
        hover && "transition-transform hover:scale-105 duration-200 cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}