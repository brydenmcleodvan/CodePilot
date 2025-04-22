import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
  noPadding?: boolean;
  id?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * A mobile-first responsive container component
 * that provides consistent spacing and max-width constraints.
 * 
 * @param children - Content to be rendered inside the container
 * @param className - Additional CSS classes
 * @param fluid - Whether the container should have a max-width (false) or be full-width (true)
 * @param noPadding - Whether the container should have padding
 * @param id - Optional ID for the container element
 * @param as - Element type to render (default: div)
 */
export function ResponsiveContainer({
  children,
  className,
  fluid = false,
  noPadding = false,
  id,
  as: Component = 'div'
}: ResponsiveContainerProps) {
  return (
    <Component
      id={id}
      className={cn(
        // Base container styles
        'w-full mx-auto',
        
        // Apply padding unless disabled
        !noPadding && 'px-4 sm:px-6 md:px-8',
        
        // Apply max-width constraint unless fluid
        !fluid && 'max-w-7xl',
        
        // Custom classes
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * A responsive grid layout component with sensible defaults for mobile-first design
 */
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string; // e.g. "gap-4" or "gap-x-4 gap-y-6"
}

export function ResponsiveGrid({
  children,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'gap-6',
}: ResponsiveGridProps) {
  // Generate responsive grid template columns
  const gridCols = [
    `grid-cols-1`,
    columns.sm && columns.sm !== 1 ? `sm:grid-cols-${columns.sm}` : '',
    columns.md ? `md:grid-cols-${columns.md}` : '',
    columns.lg ? `lg:grid-cols-${columns.lg}` : '',
    columns.xl ? `xl:grid-cols-${columns.xl}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cn('grid', gridCols, gap, className)}>
      {children}
    </div>
  );
}

/**
 * A responsive section component with proper spacing
 */
interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function ResponsiveSection({
  children,
  className,
  id,
  title,
  description,
  titleClassName,
  descriptionClassName,
}: ResponsiveSectionProps) {
  return (
    <section 
      id={id}
      className={cn('py-8 md:py-12', className)}
    >
      {(title || description) && (
        <div className="mb-8 md:mb-12">
          {title && (
            <h2 className={cn('text-2xl md:text-3xl font-heading font-bold mb-4', titleClassName)}>
              {title}
            </h2>
          )}
          {description && (
            <p className={cn('text-gray-600 dark:text-gray-300 max-w-2xl', descriptionClassName)}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}