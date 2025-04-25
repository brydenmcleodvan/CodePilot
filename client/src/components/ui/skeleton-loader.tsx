/**
 * Skeleton Loader Components
 * 
 * A comprehensive set of animated skeleton loaders for various UI components.
 * These are designed to be used while content is loading to improve perceived performance.
 */

import { cn } from '@/lib/utils';
import React from 'react';

/**
 * Base skeleton properties
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Customize the animation type
   * @default "pulse"
   */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  
  /**
   * Whether to show the skeleton or not
   * @default true
   */
  isLoading?: boolean;
  
  /**
   * Content to show when not loading
   */
  children?: React.ReactNode;
}

/**
 * Text skeleton properties
 */
interface TextSkeletonProps extends SkeletonProps {
  /**
   * Number of lines to show
   * @default 1
   */
  lines?: number;
  
  /**
   * Width of the text skeleton
   * @default "100%"
   */
  width?: string | string[];
  
  /**
   * Last line width (as percentage of container)
   * @default 100
   */
  lastLineWidth?: number;
}

/**
 * Circle skeleton properties
 */
interface CircleSkeletonProps extends SkeletonProps {
  /**
   * Size of the circle
   * @default "3rem"
   */
  size?: string;
}

/**
 * Rectangle skeleton properties
 */
interface RectSkeletonProps extends SkeletonProps {
  /**
   * Width of the rectangle
   * @default "100%"
   */
  width?: string;
  
  /**
   * Height of the rectangle
   * @default "5rem"
   */
  height?: string;
  
  /**
   * Border radius
   * @default "0.375rem"
   */
  radius?: string;
}

/**
 * Card skeleton properties
 */
interface CardSkeletonProps extends SkeletonProps {
  /**
   * Whether to show a header
   * @default true
   */
  hasHeader?: boolean;
  
  /**
   * Whether to show an image
   * @default false 
   */
  hasImage?: boolean;
  
  /**
   * Whether to show a footer
   * @default false
   */
  hasFooter?: boolean;
  
  /**
   * Number of text lines in the content area
   * @default 3
   */
  contentLines?: number;
  
  /**
   * Height of the card
   * @default "auto"
   */
  height?: string;
}

/**
 * Table skeleton properties
 */
interface TableSkeletonProps extends SkeletonProps {
  /**
   * Number of rows
   * @default 3
   */
  rows?: number;
  
  /**
   * Number of columns
   * @default 3
   */
  columns?: number;
  
  /**
   * Whether to show a header row
   * @default true
   */
  hasHeader?: boolean;
}

/**
 * List skeleton properties
 */
interface ListSkeletonProps extends SkeletonProps {
  /**
   * Number of items
   * @default 3
   */
  items?: number;
  
  /**
   * Whether to show a circle on each item (like an avatar)
   * @default false
   */
  hasImage?: boolean;
  
  /**
   * Number of lines per item
   * @default 1
   */
  linesPerItem?: number;
}

/**
 * Chart skeleton properties
 */
interface ChartSkeletonProps extends SkeletonProps {
  /**
   * Chart type
   * @default "bar"
   */
  type?: 'bar' | 'line' | 'area' | 'donut';
  
  /**
   * Height of the chart
   * @default "15rem"
   */
  height?: string;
}

/**
 * Form field skeleton properties
 */
interface FormFieldSkeletonProps extends SkeletonProps {
  /**
   * Whether to show a label
   * @default true
   */
  hasLabel?: boolean;
  
  /**
   * Height of the input
   * @default "2.5rem"
   */
  inputHeight?: string;
  
  /**
   * Whether to show an error message
   * @default false
   */
  hasError?: boolean;
}

/**
 * Base Skeleton component
 */
const BaseSkeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animation = 'pulse', isLoading = true, children, ...props }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    const animationClass = animation === 'none' 
      ? ''
      : animation === 'shimmer' 
        ? 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:500%_100%]'
        : animation === 'wave'
          ? 'animate-wave'
          : 'animate-pulse';
    
    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted/30 rounded overflow-hidden relative',
          animationClass,
          className
        )}
        {...props}
      />
    );
  }
);
BaseSkeleton.displayName = 'BaseSkeleton';

/**
 * Text Skeleton component
 */
export const TextSkeleton = React.forwardRef<HTMLDivElement, TextSkeletonProps>(
  ({ 
    className, 
    lines = 1,
    width = '100%',
    lastLineWidth = 100,
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    // Convert single width to array
    const widths = Array.isArray(width) 
      ? width 
      : Array(lines).fill(width);
      
    // Ensure we have enough widths
    while (widths.length < lines) {
      widths.push(width as string);
    }
    
    // Apply last line width if specified
    if (lastLineWidth < 100 && lines > 1) {
      widths[lines - 1] = `${lastLineWidth}%`;
    }
    
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <BaseSkeleton
            key={index}
            className={cn(
              'h-4 rounded',
              {
                'w-full': widths[index] === '100%',
              }
            )}
            style={{ width: widths[index] }}
          />
        ))}
      </div>
    );
  }
);
TextSkeleton.displayName = 'TextSkeleton';

/**
 * Circle Skeleton component
 */
export const CircleSkeleton = React.forwardRef<HTMLDivElement, CircleSkeletonProps>(
  ({ className, size = '3rem', isLoading = true, children, ...props }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <BaseSkeleton
        ref={ref}
        className={cn('rounded-full', className)}
        style={{ width: size, height: size }}
        {...props}
      />
    );
  }
);
CircleSkeleton.displayName = 'CircleSkeleton';

/**
 * Rectangle Skeleton component
 */
export const RectSkeleton = React.forwardRef<HTMLDivElement, RectSkeletonProps>(
  ({ 
    className, 
    width = '100%', 
    height = '5rem', 
    radius = '0.375rem',
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <BaseSkeleton
        ref={ref}
        className={className}
        style={{ 
          width, 
          height, 
          borderRadius: radius 
        }}
        {...props}
      />
    );
  }
);
RectSkeleton.displayName = 'RectSkeleton';

/**
 * Card Skeleton component
 */
export const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ 
    className, 
    hasHeader = true,
    hasImage = false,
    hasFooter = false,
    contentLines = 3,
    height = 'auto',
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'border rounded-lg overflow-hidden bg-card',
          className
        )}
        style={{ height }}
        {...props}
      >
        {hasHeader && (
          <div className="p-6 pb-3">
            <TextSkeleton width="70%" className="h-6 mb-2" />
            <TextSkeleton width="40%" className="h-4" />
          </div>
        )}
        
        {hasImage && (
          <RectSkeleton height="12rem" radius="0" />
        )}
        
        <div className="p-6">
          <TextSkeleton
            lines={contentLines}
            width={['100%', '100%', '60%']}
            className="h-4"
          />
        </div>
        
        {hasFooter && (
          <div className="p-6 pt-2 border-t">
            <div className="flex justify-between">
              <TextSkeleton width="20%" className="h-4" />
              <TextSkeleton width="30%" className="h-4" />
            </div>
          </div>
        )}
      </div>
    );
  }
);
CardSkeleton.displayName = 'CardSkeleton';

/**
 * Table Skeleton component
 */
export const TableSkeleton = React.forwardRef<HTMLDivElement, TableSkeletonProps>(
  ({ 
    className, 
    rows = 3,
    columns = 3,
    hasHeader = true,
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'w-full overflow-hidden',
          className
        )}
        {...props}
      >
        <table className="w-full">
          {hasHeader && (
            <thead>
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={`th-${index}`} className="px-4 py-3 text-left">
                    <TextSkeleton width="80%" className="h-5" />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={`tr-${rowIndex}`} className="border-b border-muted/20">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={`td-${rowIndex}-${colIndex}`} className="px-4 py-3">
                    <TextSkeleton width={`${Math.random() * 40 + 50}%`} className="h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);
TableSkeleton.displayName = 'TableSkeleton';

/**
 * List Skeleton component
 */
export const ListSkeleton = React.forwardRef<HTMLDivElement, ListSkeletonProps>(
  ({ 
    className, 
    items = 3,
    hasImage = false,
    linesPerItem = 1,
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'space-y-4',
          className
        )}
        {...props}
      >
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="flex gap-3">
            {hasImage && (
              <CircleSkeleton size="3rem" />
            )}
            <div className="flex-1">
              <TextSkeleton 
                lines={linesPerItem}
                width={Array(linesPerItem).fill(0).map((_, i) => 
                  i === 0 ? '90%' : `${Math.random() * 40 + 40}%`
                )}
                className="h-4"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
);
ListSkeleton.displayName = 'ListSkeleton';

/**
 * Chart Skeleton component
 */
export const ChartSkeleton = React.forwardRef<HTMLDivElement, ChartSkeletonProps>(
  ({ 
    className, 
    type = 'bar',
    height = '15rem',
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'w-full overflow-hidden',
          className
        )}
        style={{ height }}
        {...props}
      >
        {type === 'donut' ? (
          <div className="h-full flex items-center justify-center">
            <div className="relative">
              <CircleSkeleton size="80%" className="mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CircleSkeleton 
                  size="40%" 
                  className="mx-auto bg-background" 
                  animation="none" 
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-end gap-1 p-4">
            {/* Y-axis label */}
            <div className="flex justify-between mb-2">
              <TextSkeleton width="15%" className="h-3" />
              <div className="flex-1 mx-4">
                <TextSkeleton width="30%" className="h-3" />
              </div>
              <TextSkeleton width="15%" className="h-3" />
            </div>
            
            {/* Chart visualization */}
            <div className="flex-1 flex items-end gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const barHeight = type === 'line' 
                  ? '0' 
                  : `${Math.random() * 65 + 10}%`;
                
                return (
                  <div 
                    key={i} 
                    className="flex-1 flex flex-col justify-end"
                  >
                    {type === 'line' ? (
                      // Line chart visualization
                      <div className="h-full w-full relative">
                        <div 
                          className="absolute bg-muted/30 h-2 w-2 rounded-full transform -translate-x-1/2"
                          style={{ 
                            left: '50%',
                            top: `${Math.random() * 80 + 10}%`,
                          }}
                        />
                      </div>
                    ) : (
                      // Bar chart visualization
                      <RectSkeleton 
                        height={barHeight} 
                        width="100%" 
                        className="rounded-t-sm rounded-b-none" 
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="grid grid-cols-12 gap-2 mt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <TextSkeleton key={i} width="100%" className="h-3" />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * Form Field Skeleton component
 */
export const FormFieldSkeleton = React.forwardRef<HTMLDivElement, FormFieldSkeletonProps>(
  ({ 
    className, 
    hasLabel = true,
    inputHeight = "2.5rem",
    hasError = false,
    isLoading = true,
    children,
    ...props 
  }, ref) => {
    if (!isLoading) {
      return <>{children}</>;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          className
        )}
        {...props}
      >
        {hasLabel && (
          <TextSkeleton width="30%" className="h-4" />
        )}
        <RectSkeleton height={inputHeight} />
        {hasError && (
          <TextSkeleton width="60%" className="h-3 bg-destructive/30" />
        )}
      </div>
    );
  }
);
FormFieldSkeleton.displayName = 'FormFieldSkeleton';

/**
 * Export all skeleton components
 */
export { BaseSkeleton };