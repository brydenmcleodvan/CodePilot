/**
 * Responsive Layout Components
 * 
 * A collection of responsive layout components designed to adapt to different
 * screen sizes while providing smooth transitions between states.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * Props for ResponsiveContainer component
 */
export interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Max width of the container based on breakpoints
   * @default "max-w-7xl"
   */
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | "max-w-full";
  
  /**
   * Padding values for different screen sizes
   * @default true
   */
  padding?: boolean | {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  
  /**
   * Whether to center the container horizontally
   * @default true
   */
  centered?: boolean;
}

/**
 * Responsive container that adapts to different screen sizes
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = "max-w-7xl",
  padding = true,
  centered = true,
  ...props
}: ResponsiveContainerProps) {
  // Default padding values
  const defaultPadding = {
    xs: "px-4",
    sm: "sm:px-6",
    md: "md:px-8",
    lg: "lg:px-10",
    xl: "xl:px-12"
  };
  
  // Determine padding classes
  const getPaddingClasses = () => {
    if (padding === false) return "";
    
    if (padding === true) {
      return Object.values(defaultPadding).join(" ");
    }
    
    const customPadding = padding as { xs?: string; sm?: string; md?: string; lg?: string; xl?: string; };
    
    return [
      customPadding.xs || defaultPadding.xs,
      customPadding.sm || defaultPadding.sm,
      customPadding.md || defaultPadding.md,
      customPadding.lg || defaultPadding.lg,
      customPadding.xl || defaultPadding.xl
    ].join(" ");
  };
  
  return (
    <div
      className={cn(
        maxWidth,
        getPaddingClasses(),
        centered && "mx-auto",
        "w-full transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Props for ResponsiveGrid component
 */
export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Gap between grid items
   * @default "gap-4 md:gap-6"
   */
  gap?: string;
}

/**
 * Responsive grid that changes columns based on screen size
 */
export function ResponsiveGrid({
  children,
  className,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = "gap-4 md:gap-6",
  ...props
}: ResponsiveGridProps) {
  // Generate grid columns classes
  const gridColumnsClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(" ");
  
  return (
    <div
      className={cn(
        "grid w-full transition-all duration-300",
        gridColumnsClasses,
        gap,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Props for ResponsiveFlex component
 */
export interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction at different breakpoints
   */
  direction?: {
    xs?: "row" | "col";
    sm?: "row" | "col";
    md?: "row" | "col";
    lg?: "row" | "col";
    xl?: "row" | "col";
  };
  
  /**
   * Gap between flex items
   * @default "gap-4"
   */
  gap?: string;
  
  /**
   * Alignment of items
   * @default "items-start"
   */
  align?: "items-start" | "items-center" | "items-end" | "items-stretch" | "items-baseline";
  
  /**
   * Justification of items
   * @default "justify-start"
   */
  justify?: "justify-start" | "justify-center" | "justify-end" | "justify-between" | "justify-around" | "justify-evenly";
  
  /**
   * Whether items should wrap
   * @default true
   */
  wrap?: boolean;
}

/**
 * Responsive flex container that changes direction based on screen size
 */
export function ResponsiveFlex({
  children,
  className,
  direction = { xs: "col", md: "row" },
  gap = "gap-4",
  align = "items-start",
  justify = "justify-start",
  wrap = true,
  ...props
}: ResponsiveFlexProps) {
  // Generate flex direction classes
  const flexDirectionClasses = [
    direction.xs && `flex-${direction.xs}`,
    direction.sm && `sm:flex-${direction.sm}`,
    direction.md && `md:flex-${direction.md}`,
    direction.lg && `lg:flex-${direction.lg}`,
    direction.xl && `xl:flex-${direction.xl}`,
  ].filter(Boolean).join(" ");
  
  return (
    <div
      className={cn(
        "flex w-full transition-all duration-300",
        flexDirectionClasses,
        gap,
        align,
        justify,
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Props for ResponsiveStack component
 */
export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Gap between stacked elements
   * @default "gap-4 md:gap-6"
   */
  gap?: string;
  
  /**
   * Whether to use dividers between items
   * @default false
   */
  dividers?: boolean;
}

/**
 * Responsive stack for vertical layouts
 */
export function ResponsiveStack({
  children,
  className,
  gap = "gap-4 md:gap-6",
  dividers = false,
  ...props
}: ResponsiveStackProps) {
  const items = React.Children.toArray(children);
  
  return (
    <div
      className={cn(
        "flex flex-col w-full transition-all duration-300",
        gap,
        className
      )}
      {...props}
    >
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {dividers && index < items.length - 1 && (
            <div className="border-b border-border w-full my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Props for ResponsiveColumns component
 */
export interface ResponsiveColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column configuration for different screens
   */
  columns: {
    xs?: number[]; // Column widths must sum to 12, e.g. [12] or [6, 6] or [3, 6, 3]
    sm?: number[];
    md?: number[];
    lg?: number[];
    xl?: number[];
  };
  
  /**
   * Gap between columns
   * @default "gap-4 md:gap-6"
   */
  gap?: string;
  
  /**
   * Whether columns should reverse order on mobile
   * @default false
   */
  reverseOnMobile?: boolean;
}

/**
 * Responsive columns layout
 */
export function ResponsiveColumns({
  children,
  className,
  columns,
  gap = "gap-4 md:gap-6",
  reverseOnMobile = false,
  ...props
}: ResponsiveColumnsProps) {
  const items = React.Children.toArray(children);
  
  // Ensure we don't have more children than columns
  const maxColumnsCount = Math.max(
    ...[columns.xs, columns.sm, columns.md, columns.lg, columns.xl]
      .filter(Boolean)
      .map(cols => cols.length)
  );
  
  if (items.length > maxColumnsCount) {
    console.warn(`ResponsiveColumns has ${items.length} children but only ${maxColumnsCount} columns.`);
  }
  
  return (
    <div
      className={cn(
        "grid w-full transition-all duration-300",
        gap,
        reverseOnMobile && "flex flex-col-reverse md:grid",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(12, 1fr)`,
      }}
      {...props}
    >
      {items.map((child, index) => {
        // Calculate column spans for different breakpoints
        const getColumnClass = (colsArray: number[] | undefined, breakpoint: string) => {
          if (!colsArray || !colsArray[index]) return "";
          const span = colsArray[index];
          return breakpoint ? `${breakpoint}:col-span-${span}` : `col-span-${span}`;
        };
        
        const columnClasses = [
          getColumnClass(columns.xs, ""),
          getColumnClass(columns.sm, "sm"),
          getColumnClass(columns.md, "md"),
          getColumnClass(columns.lg, "lg"),
          getColumnClass(columns.xl, "xl"),
        ].filter(Boolean).join(" ");
        
        return (
          <div key={index} className={columnClasses}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Props for ResponsiveSplitView component
 */
export interface ResponsiveSplitViewProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Content for the left/top side
   */
  left: React.ReactNode;
  
  /**
   * Content for the right/bottom side
   */
  right: React.ReactNode;
  
  /**
   * Split direction on desktop
   * @default "horizontal"
   */
  direction?: "horizontal" | "vertical";
  
  /**
   * Split direction on mobile
   * @default "vertical"
   */
  mobileDirection?: "horizontal" | "vertical";
  
  /**
   * Ratio of the split (must sum to 10)
   * @default [5, 5]
   */
  ratio?: [number, number];
  
  /**
   * Ratio on mobile (must sum to 10)
   * @default [10, 10]
   */
  mobileRatio?: [number, number];
  
  /**
   * Breakpoint at which to switch to mobile layout
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl";
  
  /**
   * Gap between the two sides
   * @default "gap-4 md:gap-6"
   */
  gap?: string;
}

/**
 * Responsive split view component
 */
export function ResponsiveSplitView({
  className,
  left,
  right,
  direction = "horizontal",
  mobileDirection = "vertical",
  ratio = [5, 5],
  mobileRatio = [10, 10],
  breakpoint = "md",
  gap = "gap-4 md:gap-6",
  ...props
}: ResponsiveSplitViewProps) {
  // Ensure ratios sum to 10
  if (ratio[0] + ratio[1] !== 10) {
    console.warn("Split view ratio must sum to 10. Adjusting to default [5, 5].");
    ratio = [5, 5];
  }
  
  if (mobileRatio[0] + mobileRatio[1] !== 10 && mobileRatio[0] + mobileRatio[1] !== 20) {
    console.warn("Split view mobile ratio must sum to 10 or 20. Adjusting to default [10, 10].");
    mobileRatio = [10, 10];
  }
  
  // Convert ratio to grid template
  const getGridTemplate = (r: [number, number], dir: "horizontal" | "vertical") => {
    const cols = r[0] * 10;
    const rows = r[1] * 10;
    
    if (dir === "horizontal") {
      return `grid-cols-${cols} grid-cols-${10 - cols}`;
    } else {
      return `grid-rows-${rows} grid-rows-${10 - rows}`;
    }
  };
  
  // Classes based on direction
  const getDirectionClass = (dir: "horizontal" | "vertical") => {
    return dir === "horizontal" ? "grid-cols-12" : "grid-rows-12 h-full";
  };
  
  // Responsive classes
  const mobileClass = getDirectionClass(mobileDirection);
  const desktopClass = getDirectionClass(direction);
  
  // Apply grid spans based on ratio
  const leftColumnSpan = `col-span-${mobileRatio[0]} ${breakpoint}:col-span-${ratio[0]}`;
  const rightColumnSpan = `col-span-${mobileRatio[1]} ${breakpoint}:col-span-${ratio[1]}`;
  
  return (
    <div
      className={cn(
        "grid w-full transition-all duration-300",
        `${mobileClass} ${breakpoint}:${desktopClass}`,
        gap,
        className
      )}
      {...props}
    >
      <div className={leftColumnSpan}>{left}</div>
      <div className={rightColumnSpan}>{right}</div>
    </div>
  );
}

/**
 * Props for ResponsiveAspectRatio component
 */
export interface ResponsiveAspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Aspect ratio as width/height
   * @default 16/9
   */
  ratio?: number;
  
  /**
   * Aspect ratio on mobile
   */
  mobileRatio?: number;
  
  /**
   * Breakpoint at which to switch to mobile ratio
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

/**
 * Responsive aspect ratio container
 */
export function ResponsiveAspectRatio({
  children,
  className,
  ratio = 16/9,
  mobileRatio,
  breakpoint = "md",
  ...props
}: ResponsiveAspectRatioProps) {
  const mobileStyle = mobileRatio ? { paddingBottom: `${(1 / mobileRatio) * 100}%` } : undefined;
  const desktopStyle = { paddingBottom: `${(1 / ratio) * 100}%` };
  
  // Use CSS custom properties for responsive ratio
  return (
    <div
      className={cn(
        "relative w-full transition-all duration-300",
        className
      )}
      style={{
        paddingBottom: `${(1 / (mobileRatio || ratio)) * 100}%`,
        [`--${breakpoint}-padding-bottom` as any]: mobileRatio ? `${(1 / ratio) * 100}%` : undefined
      }}
      {...props}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}

/**
 * Props for ResponsiveHideShow component
 */
export interface ResponsiveHideShowProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Which screens to hide on
   */
  hideOn?: ("xs" | "sm" | "md" | "lg" | "xl")[];
  
  /**
   * Which screens to show on
   */
  showOn?: ("xs" | "sm" | "md" | "lg" | "xl")[];
  
  /**
   * Whether to remove from DOM when hidden
   * @default false
   */
  removeFromDom?: boolean;
}

/**
 * Component to conditionally hide or show content based on screen size
 */
export function ResponsiveHideShow({
  children,
  className,
  hideOn = [],
  showOn = [],
  removeFromDom = false,
  ...props
}: ResponsiveHideShowProps) {
  // Convert to utility classes
  const breakpoints = {
    xs: "",
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl"
  };
  
  // Generate hide classes
  const hideClasses = hideOn.map(bp => {
    const prefix = breakpoints[bp] ? `${breakpoints[bp]}:` : "";
    return `${prefix}hidden`;
  });
  
  // Generate show classes
  const showClasses = showOn.map(bp => {
    const prefix = breakpoints[bp] ? `${breakpoints[bp]}:` : "";
    return `${prefix}block`;
  });
  
  // If we're removing from DOM, we need to detect the current breakpoint
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (removeFromDom && (hideOn.length > 0 || showOn.length > 0)) {
      const checkBreakpoint = () => {
        const width = window.innerWidth;
        
        // Map to currently active breakpoint
        let currentBreakpoint: "xs" | "sm" | "md" | "lg" | "xl" = "xs";
        if (width >= 1280) currentBreakpoint = "xl";
        else if (width >= 1024) currentBreakpoint = "lg";
        else if (width >= 768) currentBreakpoint = "md";
        else if (width >= 640) currentBreakpoint = "sm";
        
        // Determine visibility based on hideOn and showOn
        let shouldShow = true;
        
        if (hideOn.includes(currentBreakpoint)) {
          shouldShow = false;
        }
        
        if (showOn.length > 0 && !showOn.includes(currentBreakpoint)) {
          shouldShow = false;
        }
        
        setIsVisible(shouldShow);
      };
      
      checkBreakpoint();
      window.addEventListener('resize', checkBreakpoint);
      
      return () => {
        window.removeEventListener('resize', checkBreakpoint);
      };
    }
  }, [hideOn, showOn, removeFromDom]);
  
  // If removing from DOM and not visible, return null
  if (removeFromDom && !isVisible) {
    return null;
  }
  
  return (
    <div
      className={cn(
        "transition-all duration-300",
        ...hideClasses,
        ...showClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Props for StaggeredGrid component
 */
export interface StaggeredGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Items to render in the grid
   */
  items: React.ReactNode[];
  
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Gap between grid items
   * @default "gap-4 md:gap-6"
   */
  gap?: string;
  
  /**
   * Animation stagger delay in seconds
   * @default 0.05
   */
  staggerDelay?: number;
  
  /**
   * Animation duration in seconds
   * @default 0.5
   */
  duration?: number;
}

/**
 * Grid with staggered animation for items
 */
export function StaggeredGrid({
  className,
  items,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = "gap-4 md:gap-6",
  staggerDelay = 0.05,
  duration = 0.5,
  ...props
}: StaggeredGridProps) {
  // Generate grid columns classes
  const gridColumnsClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(" ");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <motion.div
      className={cn("grid w-full", gridColumnsClasses, gap, className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...props}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Props for MasonryGrid component
 */
export interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Items to render in the grid
   */
  items: React.ReactNode[];
  
  /**
   * Number of columns at different breakpoints
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Gap between grid items
   * @default "gap-4 md:gap-6"
   */
  gap?: string;
  
  /**
   * Animation stagger delay in seconds
   * @default 0.05
   */
  staggerDelay?: number;
}

/**
 * Masonry grid layout with staggered animation
 */
export function MasonryGrid({
  className,
  items,
  columns = { xs: 1, sm: 2, md: 3, lg: 3, xl: 4 },
  gap = "gap-4 md:gap-6",
  staggerDelay = 0.05,
  ...props
}: MasonryGridProps) {
  // Get the number of columns at the current viewport
  const [activeColumns, setActiveColumns] = useState(1);
  
  // Update columns on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280 && columns.xl) setActiveColumns(columns.xl);
      else if (width >= 1024 && columns.lg) setActiveColumns(columns.lg);
      else if (width >= 768 && columns.md) setActiveColumns(columns.md);
      else if (width >= 640 && columns.sm) setActiveColumns(columns.sm);
      else if (columns.xs) setActiveColumns(columns.xs);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [columns]);
  
  // Distribute items across columns
  const columnItems = Array.from({ length: activeColumns }, () => []);
  
  items.forEach((item, index) => {
    columnItems[index % activeColumns].push(item);
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  };
  
  return (
    <motion.div
      className={cn("grid w-full", `grid-cols-${activeColumns}`, gap, className)}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...props}
    >
      {columnItems.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-y-4 md:gap-y-6">
          {column.map((item, itemIndex) => (
            <motion.div key={itemIndex} variants={itemVariants}>
              {item}
            </motion.div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}