import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  subtitle?: string;
  image?: string | null;
  tags?: string[] | null;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card = ({
  title,
  subtitle,
  image,
  tags,
  children,
  className,
  onClick,
}: CardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 min-h-[360px] p-4 flex flex-col",
        className
      )}
      onClick={onClick}
    >
      {image && (
        <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">
            {subtitle}
          </p>
        )}
        
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500">+{tags.length - 3} more</span>
            )}
          </div>
        )}
        
        {children && (
          <div className="mt-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;