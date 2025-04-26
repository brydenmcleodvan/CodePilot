/**
 * Transition Components
 * 
 * A collection of reusable transition components that provide smooth animations
 * for various UI interactions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, MotionProps, Variant, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// Create custom types that omit the conflicting types
type MotionDivProps = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "variants">;

/**
 * Fade transition variants
 */
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide transition variants
 */
export const slideVariants = {
  // Slide from directions
  fromTop: {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },
  fromBottom: {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      y: 20, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },
  fromLeft: {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      x: -20, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },
  fromRight: {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      x: 20, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }
};

/**
 * Scale transition variants
 */
export const scaleVariants = {
  // Scale variants
  scaleUp: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },
  scaleDown: {
    hidden: { scale: 1.1, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      scale: 1.1, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }
};

/**
 * Flip transition variants
 */
export const flipVariants = {
  flipX: {
    hidden: { rotateX: 90, opacity: 0 },
    visible: { 
      rotateX: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 200
      }
    },
    exit: { 
      rotateX: 90, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  },
  flipY: {
    hidden: { rotateY: 90, opacity: 0 },
    visible: { 
      rotateY: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 200
      }
    },
    exit: { 
      rotateY: 90, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  }
};

/**
 * Stagger variants for list animations
 */
export const staggerVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, 
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  },
  item: {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      y: 15,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }
};

/**
 * Props for TransitionComponent
 */
export interface TransitionProps extends Omit<MotionDivProps, "initial" | "animate" | "exit"> {
  /**
   * Whether the component is visible
   * @default true
   */
  isVisible?: boolean;
  
  /**
   * The animation variant to use
   * @default 'fade'
   */
  variant?: 
    'fade' | 
    'slideFromTop' | 'slideFromBottom' | 'slideFromLeft' | 'slideFromRight' |
    'scaleUp' | 'scaleDown' |
    'flipX' | 'flipY';
  
  /**
   * The Framer Motion transition object
   */
  transition?: any;
  
  /**
   * Duration for the animation in seconds
   */
  duration?: number;
  
  /**
   * Whether to remove the component from the DOM when not visible
   * @default true
   */
  removeFromDom?: boolean;
  
  /**
   * Custom initial properties for the animation
   */
  initial?: any;
  
  /**
   * Custom animate properties for the animation
   */
  animate?: any;
  
  /**
   * Custom exit properties for the animation
   */
  exit?: any;
  
  /**
   * The element to render
   * @default 'div'
   */
  as?: React.ElementType;
}

/**
 * General Transition component with various animation options
 */
export function Transition({
  children,
  className,
  isVisible = true,
  variant = 'fade',
  transition,
  duration,
  removeFromDom = true,
  initial,
  animate,
  exit,
  as: Component = 'div',
  ...props
}: TransitionProps) {
  // Get the correct variant based on the provided prop
  const getVariant = (): any => {
    switch (variant) {
      case 'fade':
        return fadeVariants;
      case 'slideFromTop':
        return slideVariants.fromTop;
      case 'slideFromBottom':
        return slideVariants.fromBottom;
      case 'slideFromLeft':
        return slideVariants.fromLeft;
      case 'slideFromRight':
        return slideVariants.fromRight;
      case 'scaleUp':
        return scaleVariants.scaleUp;
      case 'scaleDown':
        return scaleVariants.scaleDown;
      case 'flipX':
        return flipVariants.flipX;
      case 'flipY':
        return flipVariants.flipY;
      default:
        return fadeVariants;
    }
  };
  
  // Apply custom transition duration if provided
  const variantWithDuration = duration
    ? {
        ...getVariant(),
        visible: {
          ...getVariant().visible,
          transition: {
            ...getVariant().visible.transition,
            duration,
          },
        },
      }
    : getVariant();
    
  // Custom transition object if provided
  const transitionObject = transition
    ? {
        ...variantWithDuration,
        visible: {
          ...variantWithDuration.visible,
          transition,
        },
      }
    : variantWithDuration;
  
  return (
    <AnimatePresence mode="wait">
      {(isVisible || !removeFromDom) && (
        <motion.div
          className={className}
          initial={initial || "hidden"}
          animate={isVisible ? (animate || "visible") : "hidden"}
          exit={exit || "exit"}
          variants={transitionObject}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Props for FadeTransition component
 */
export interface FadeTransitionProps extends TransitionProps {}

/**
 * Fade transition component
 */
export function FadeTransition(props: FadeTransitionProps) {
  return <Transition variant="fade" {...props} />;
}

/**
 * Props for SlideTransition component
 */
export interface SlideTransitionProps extends TransitionProps {
  /**
   * Direction to slide from
   * @default 'bottom'
   */
  direction?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Slide transition component
 */
export function SlideTransition({
  direction = 'bottom',
  ...props
}: SlideTransitionProps) {
  const directionMap = {
    top: 'slideFromTop',
    bottom: 'slideFromBottom',
    left: 'slideFromLeft',
    right: 'slideFromRight',
  } as const;
  
  return <Transition variant={directionMap[direction]} {...props} />;
}

/**
 * Props for ScaleTransition component
 */
export interface ScaleTransitionProps extends TransitionProps {
  /**
   * Direction to scale from
   * @default 'up'
   */
  direction?: 'up' | 'down';
}

/**
 * Scale transition component
 */
export function ScaleTransition({
  direction = 'up',
  ...props
}: ScaleTransitionProps) {
  const directionMap = {
    up: 'scaleUp',
    down: 'scaleDown',
  } as const;
  
  return <Transition variant={directionMap[direction]} {...props} />;
}

/**
 * Props for FlipTransition component
 */
export interface FlipTransitionProps extends TransitionProps {
  /**
   * Axis to flip around
   * @default 'x'
   */
  axis?: 'x' | 'y';
}

/**
 * Flip transition component
 */
export function FlipTransition({
  axis = 'x',
  ...props
}: FlipTransitionProps) {
  const axisMap = {
    x: 'flipX',
    y: 'flipY',
  } as const;
  
  return <Transition variant={axisMap[axis]} {...props} />;
}

/**
 * Props for StaggerList component
 */
export interface StaggerListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the list is visible
   * @default true
   */
  isVisible?: boolean;
  
  /**
   * Custom variant for container
   */
  containerVariant?: Record<string, any>;
  
  /**
   * Custom variant for items
   */
  itemVariant?: Record<string, any>;
  
  /**
   * Data array to map over (optional, can use children instead)
   */
  items?: any[];
  
  /**
   * Render function for items (required if items prop is provided)
   */
  renderItem?: (item: any, index: number) => React.ReactNode;
  
  /**
   * Container element (ul, div, etc)
   * @default 'div'
   */
  as?: React.ElementType;
  
  /**
   * Item element (li, div, etc)
   * @default 'div'
   */
  itemAs?: React.ElementType;
}

/**
 * Stagger List component for animated lists
 */
export function StaggerList({
  children,
  className,
  isVisible = true,
  containerVariant,
  itemVariant,
  items,
  renderItem,
  as: Container = 'div',
  itemAs: Item = 'div',
  ...props
}: StaggerListProps) {
  const containerVariants = containerVariant || staggerVariants.container;
  const itemVariants = itemVariant || staggerVariants.item;
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.ul
          className={className}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          {...props}
        >
          {items && renderItem
            ? items.map((item, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                >
                  {renderItem(item, index)}
                </motion.li>
              ))
            : React.Children.map(children, (child, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                >
                  {child}
                </motion.li>
              ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}

/**
 * Props for AnimatedNumber component
 */
export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

/**
 * Animated Number component for counting animations
 */
export function AnimatedNumber({ 
  value, 
  duration = 1.5, 
  className, 
  formatter = (val) => val.toFixed(0)
}: AnimatedNumberProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    let startValue = displayValue;
    const endValue = value;
    const startTime = performance.now();
    
    const updateValue = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Use spring-like easing
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };
    
    requestAnimationFrame(updateValue);
  }, [value, duration]);
  
  return (
    <span className={className} ref={nodeRef}>
      {formatter(displayValue)}
    </span>
  );
}

/**
 * Props for CollapsibleSection component
 */
export interface CollapsibleSectionProps {
  /**
   * Whether the section is expanded
   */
  isExpanded: boolean;
  
  /**
   * Children to render
   */
  children: React.ReactNode;
  
  /**
   * Duration for the animation in seconds
   * @default 0.3
   */
  duration?: number;
  
  /**
   * Additional classes
   */
  className?: string;
}

/**
 * Collapsible Section component for accordion-like UI elements
 */
export function CollapsibleSection({
  isExpanded, 
  children,
  duration = 0.3,
  className
}: CollapsibleSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(0);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    if (isExpanded) {
      const sectionHeight = sectionRef.current.scrollHeight;
      setHeight(sectionHeight);
      
      // After animation completes, set height to "auto" for responsive content
      const timeout = setTimeout(() => {
        setHeight("auto");
      }, duration * 1000);
      
      return () => clearTimeout(timeout);
    } else {
      // Set to the current height before collapsing
      if (sectionRef.current) {
        setHeight(sectionRef.current.offsetHeight);
        
        // Force a reflow
        void sectionRef.current.offsetHeight; 
        
        // Then animate to 0
        setHeight(0);
      }
    }
  }, [isExpanded, duration]);
  
  return (
    <div
      ref={sectionRef}
      className={cn("overflow-hidden transition-all", className)}
      style={{ 
        height: height === "auto" ? "auto" : `${height}px`,
        transitionDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  );
}

/**
 * Props for AnimatedTabPanel component
 */
export interface AnimatedTabPanelProps {
  /**
   * The tab content to display
   */
  children: React.ReactNode;
  
  /**
   * The current active tab index/value
   */
  activeTab: string | number;
  
  /**
   * This tab's value
   */
  value: string | number;
  
  /**
   * Animation direction for tab switching
   * @default 'right'
   */
  direction?: 'left' | 'right' | 'up' | 'down';
  
  /**
   * Additional classes
   */
  className?: string;
}

/**
 * Animated Tab Panel component for tab transitions
 */
export function AnimatedTabPanel({
  children,
  activeTab,
  value,
  direction = 'right',
  className
}: AnimatedTabPanelProps) {
  // Choose variant based on direction
  const getVariant = () => {
    switch (direction) {
      case 'left': return slideVariants.fromLeft;
      case 'right': return slideVariants.fromRight;
      case 'up': return slideVariants.fromTop;
      case 'down': return slideVariants.fromBottom;
      default: return slideVariants.fromRight;
    }
  };
  
  return (
    <AnimatePresence mode="wait">
      {activeTab === value && (
        <motion.div
          key={value}
          className={cn("w-full", className)}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={getVariant()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Props for CrossfadeImage component
 */
export interface CrossfadeImageProps {
  /**
   * Current image source
   */
  src: string;
  
  /**
   * Alternative text for the image
   */
  alt: string;
  
  /**
   * Duration for the crossfade in seconds
   * @default 0.5
   */
  duration?: number;
  
  /**
   * Additional classes
   */
  className?: string;
  
  /**
   * Image width
   */
  width?: number | string;
  
  /**
   * Image height
   */
  height?: number | string;
}

/**
 * Crossfade Image component for smooth image transitions
 */
export function CrossfadeImage({
  src,
  alt,
  duration = 0.5,
  className,
  width,
  height,
  ...props
}: CrossfadeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    if (currentSrc !== src) {
      // Start loading the new image
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setIsLoading(false);
        setCurrentSrc(src);
        setHasLoaded(true);
      };
      
      img.onerror = () => {
        setIsLoading(false);
      };
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [src, currentSrc]);
  
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          {...props}
        />
      </AnimatePresence>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <div className="animate-pulse w-8 h-8 rounded-full bg-muted"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Props for ScrollReveal component
 */
export interface ScrollRevealProps {
  /**
   * Children to render
   */
  children: React.ReactNode;
  
  /**
   * Animation variant
   * @default 'fadeIn'
   */
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleUp' | 'scaleDown';
  
  /**
   * Amount of delay (seconds) before animation starts
   * @default 0
   */
  delay?: number;
  
  /**
   * Duration for the animation in seconds
   * @default 0.5
   */
  duration?: number;
  
  /**
   * Threshold for when the animation should trigger (0-1)
   * @default 0.2
   */
  threshold?: number;
  
  /**
   * Whether animation should only trigger once
   * @default true
   */
  triggerOnce?: boolean;
  
  /**
   * Additional classes
   */
  className?: string;
}

/**
 * Scroll Reveal component for animations on scroll
 */
export function ScrollReveal({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5,
  threshold = 0.2,
  triggerOnce = true,
  className
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (triggerOnce) {
            observer.unobserve(currentRef);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, triggerOnce]);
  
  // Animation variants
  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration,
          delay
        }
      }
    },
    slideUp: {
      hidden: { y: 30, opacity: 0 },
      visible: { 
        y: 0, 
        opacity: 1,
        transition: { 
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay
        }
      }
    },
    slideLeft: {
      hidden: { x: -30, opacity: 0 },
      visible: { 
        x: 0, 
        opacity: 1,
        transition: { 
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay
        }
      }
    },
    slideRight: {
      hidden: { x: 30, opacity: 0 },
      visible: { 
        x: 0, 
        opacity: 1,
        transition: { 
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay
        }
      }
    },
    scaleUp: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { 
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay
        }
      }
    },
    scaleDown: {
      hidden: { scale: 1.1, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { 
          type: 'spring',
          damping: 25,
          stiffness: 300,
          delay
        }
      }
    }
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants[animation]}
    >
      {children}
    </motion.div>
  );
}