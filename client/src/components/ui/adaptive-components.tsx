/**
 * Adaptive Components
 * 
 * UI components that intelligently adapt to different screen sizes
 * while providing smooth transitions between states.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MenuIcon, 
  X as CloseIcon, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Transition } from '@/components/ui/transitions';

/**
 * Props for AdaptiveNavbar component
 */
export interface AdaptiveNavbarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Brand/logo component to display
   */
  brand: React.ReactNode;
  
  /**
   * Navigation items
   */
  items: {
    label: string;
    href?: string;
    children?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
    }[];
    icon?: React.ReactNode;
    onClick?: () => void;
  }[];
  
  /**
   * Actions to display on the right side
   */
  actions?: React.ReactNode;
  
  /**
   * Sticky positioning
   * @default false
   */
  sticky?: boolean;
  
  /**
   * Whether navbar should be transparent when at top
   * @default false
   */
  transparentAtTop?: boolean;
  
  /**
   * Whether to show a full-height mobile menu
   * @default false
   */
  fullHeightMobile?: boolean;
  
  /**
   * Whether to collapse navbar on scroll down
   * @default false
   */
  collapseOnScroll?: boolean;
}

/**
 * Adaptive navbar that changes layout and behavior based on screen size
 */
export function AdaptiveNavbar({
  className,
  brand,
  items,
  actions,
  sticky = false,
  transparentAtTop = false,
  fullHeightMobile = false,
  collapseOnScroll = false,
  ...props
}: AdaptiveNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Handle scroll effects (transparency and collapse)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if at top for transparency
      if (transparentAtTop) {
        setIsAtTop(currentScrollY < 10);
      }
      
      // Handle collapse on scroll
      if (collapseOnScroll) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [transparentAtTop, collapseOnScroll]);
  
  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Toggle submenu
  const toggleSubmenu = (index: number) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };
  
  return (
    <motion.header
      className={cn(
        "relative w-full z-40 transition-all duration-300",
        sticky && "sticky top-0",
        transparentAtTop && isAtTop ? "bg-transparent" : "bg-background shadow-sm",
        collapseOnScroll && !isVisible && "transform -translate-y-full",
        className
      )}
      animate={{ y: collapseOnScroll && !isVisible ? -100 : 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        {/* Brand */}
        <div className="flex items-center">
          {brand}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {items.map((item, index) => (
            <div key={index} className="relative group">
              {item.href ? (
                <a
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  onClick={item.onClick}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                  {item.children && <ChevronDown className="w-4 h-4 opacity-70" />}
                </a>
              ) : (
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  onClick={item.onClick || (() => {})}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                  {item.children && <ChevronDown className="w-4 h-4 opacity-70" />}
                </button>
              )}
              
              {/* Desktop Dropdown */}
              {item.children && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-popover rounded-md shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left">
                  {item.children.map((child, childIndex) => (
                    <a
                      key={childIndex}
                      href={child.href}
                      className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center"
                    >
                      {child.icon && <span className="mr-2">{child.icon}</span>}
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Actions */}
        <div className="hidden lg:flex items-center ml-4">
          {actions}
        </div>
        
        {/* Mobile Navigation Toggle */}
        <div className="flex lg:hidden items-center space-x-4">
          {actions && (
            <div className="mr-2">
              {actions}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="focus:ring-0"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: fullHeightMobile ? "calc(100vh - 4rem)" : "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-background"
          >
            <ScrollArea className={cn(
              "container py-4",
              fullHeightMobile && "max-h-[calc(100vh-4rem)]"
            )}>
              <div className="flex flex-col space-y-1">
                {items.map((item, index) => (
                  <div key={index} className="py-1">
                    {item.children ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(index)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center text-base font-medium">
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.label}
                          </span>
                          {activeSubmenu === index ? (
                            <ChevronUp className="h-4 w-4 opacity-70" />
                          ) : (
                            <ChevronDown className="h-4 w-4 opacity-70" />
                          )}
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {activeSubmenu === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-4 mt-1 border-l border-muted"
                            >
                              {item.children.map((child, childIndex) => (
                                <a
                                  key={childIndex}
                                  href={child.href}
                                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                                >
                                  {child.icon && <span className="mr-2">{child.icon}</span>}
                                  {child.label}
                                </a>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={item.href}
                        className="flex items-center px-3 py-2 rounded-md hover:bg-muted transition-colors"
                        onClick={item.onClick}
                      >
                        {item.icon && <span className="mr-2">{item.icon}</span>}
                        <span className="text-base font-medium">{item.label}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/**
 * Props for AdaptiveCard component
 */
export interface AdaptiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card title
   */
  title?: React.ReactNode;
  
  /**
   * Card description/subtitle
   */
  description?: React.ReactNode;
  
  /**
   * Card media/image
   */
  media?: React.ReactNode;
  
  /**
   * Card footer
   */
  footer?: React.ReactNode;
  
  /**
   * Card actions
   */
  actions?: React.ReactNode;
  
  /**
   * Whether to make card fully clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Link for clickable card
   */
  href?: string;
  
  /**
   * Click handler for clickable card
   */
  onClick?: () => void;
  
  /**
   * Card variant
   * @default "default"
   */
  variant?: "default" | "horizontal" | "compact" | "featured";
  
  /**
   * Cards will become vertical on screens smaller than this breakpoint 
   * if variant is horizontal
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

/**
 * Adaptive card component that changes layout based on screen size and variant
 */
export function AdaptiveCard({
  className,
  title,
  description,
  media,
  footer,
  actions,
  children,
  clickable = false,
  href,
  onClick,
  variant = "default",
  breakpoint = "md",
  ...props
}: AdaptiveCardProps) {
  // Handler for click events
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    } else if (clickable && href) {
      window.location.href = href;
    }
  };
  
  // Wrapper component based on clickable state
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (clickable) {
      if (href) {
        return (
          <a 
            href={href} 
            className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          >
            {children}
          </a>
        );
      }
      return (
        <button 
          onClick={onClick} 
          className="block w-full text-left h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        >
          {children}
        </button>
      );
    }
    return <>{children}</>;
  };
  
  // Classes based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case "horizontal":
        return `flex flex-col ${breakpoint}:flex-row overflow-hidden`;
      case "compact":
        return "p-4";
      case "featured":
        return "relative overflow-hidden";
      default:
        return "";
    }
  };
  
  return (
    <Wrapper>
      <div
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
          clickable && "hover:shadow-md cursor-pointer",
          getVariantClasses(),
          className
        )}
        onClick={clickable ? handleClick : undefined}
        {...props}
      >
        {/* Media positioning */}
        {media && variant === "horizontal" && (
          <div className={`${breakpoint}:w-1/3 max-h-56 ${breakpoint}:max-h-full overflow-hidden`}>
            {media}
          </div>
        )}
        {media && variant === "featured" && (
          <div className="w-full h-48 md:h-64 overflow-hidden">{media}</div>
        )}
        {media && variant !== "horizontal" && variant !== "featured" && (
          <div className="rounded-t-lg overflow-hidden">{media}</div>
        )}
        
        {/* Content */}
        <div className={cn(
          variant === "compact" ? "" : "p-6",
          variant === "horizontal" && `flex-1 ${breakpoint}:max-w-2/3`
        )}>
          {variant === "featured" && media && (
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          )}
          
          {(title || description) && (
            <div className={cn(
              "space-y-1.5",
              variant === "featured" && media && "absolute bottom-0 left-0 right-0 p-6"
            )}>
              {title && (
                <h3 className={cn(
                  "font-semibold leading-none tracking-tight",
                  variant === "featured" && "text-xl md:text-2xl"
                )}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          
          {children && (
            <div className={title || description ? "mt-4" : ""}>
              {children}
            </div>
          )}
          
          {actions && (
            <div className="mt-4 flex items-center justify-end gap-2">
              {actions}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className={cn(
            "border-t px-6 py-4",
            variant === "compact" && "px-4 py-3"
          )}>
            {footer}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

/**
 * Props for AdaptiveSidebar component
 */
export interface AdaptiveSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the sidebar is open
   */
  isOpen: boolean;
  
  /**
   * Function to set sidebar open state
   */
  setIsOpen: (open: boolean) => void;
  
  /**
   * Sidebar position
   * @default "left"
   */
  position?: "left" | "right";
  
  /**
   * Whether to show sidebar as drawer on mobile
   * @default true
   */
  drawerOnMobile?: boolean;
  
  /**
   * Breakpoint at which to switch to mobile mode
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl";
  
  /**
   * Whether to overlay the content on mobile
   * @default true
   */
  overlay?: boolean;
  
  /**
   * Width of sidebar on desktop
   * @default "300px"
   */
  width?: string;
  
  /**
   * Width of sidebar on mobile
   * @default "280px"
   */
  mobileWidth?: string;
  
  /**
   * Header content
   */
  header?: React.ReactNode;
  
  /**
   * Footer content
   */
  footer?: React.ReactNode;
}

/**
 * Adaptive sidebar component that changes behavior based on screen size
 */
export function AdaptiveSidebar({
  className,
  children,
  isOpen,
  setIsOpen,
  position = "left",
  drawerOnMobile = true,
  breakpoint = "md",
  overlay = true,
  width = "300px",
  mobileWidth = "280px",
  header,
  footer,
  ...props
}: AdaptiveSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Update layout on window resize
  useEffect(() => {
    const checkWidth = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      };
      
      setIsMobile(window.innerWidth < breakpoints[breakpoint]);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, [breakpoint]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsOpen]);
  
  return (
    <>
      {/* Overlay */}
      {overlay && isMobile && isOpen && (
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <motion.div
        className={cn(
          "fixed top-0 bottom-0 z-50 flex flex-col bg-background border-r",
          position === "left" ? "left-0" : "right-0",
          isMobile && !isOpen && (position === "left" ? "-translate-x-full" : "translate-x-full"),
          isMobile ? "w-[--mobile-width]" : "w-[--width]",
          !isMobile && !drawerOnMobile && `${breakpoint}:relative ${breakpoint}:z-0`,
          !isOpen && !isMobile && !drawerOnMobile && (position === "left" ? `${breakpoint}:translate-x-0` : `${breakpoint}:translate-x-0`),
          className
        )}
        style={{
          "--width": width,
          "--mobile-width": mobileWidth
        } as React.CSSProperties}
        animate={{ 
          x: isMobile && !isOpen ? (position === "left" ? -1 * parseInt(mobileWidth) : parseInt(mobileWidth)) : 0 
        }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        {...props}
      >
        {/* Header */}
        {header && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {header}
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <CloseIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {children}
        </ScrollArea>
        
        {/* Footer */}
        {footer && (
          <div className="p-4 border-t">
            {footer}
          </div>
        )}
      </motion.div>
    </>
  );
}

/**
 * Props for AdaptiveMenu component
 */
export interface AdaptiveMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Trigger element for the menu
   */
  trigger: React.ReactNode;
  
  /**
   * Menu items
   */
  items: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
    divider?: boolean;
    disabled?: boolean;
    danger?: boolean;
  }[];
  
  /**
   * Position of the menu
   * @default "bottom-right"
   */
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  
  /**
   * Open menu as a drawer on mobile
   * @default true
   */
  drawerOnMobile?: boolean;
  
  /**
   * Breakpoint at which to switch to mobile mode
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl";
  
  /**
   * Width of the menu
   * @default "200px"
   */
  width?: string;
}

/**
 * Adaptive menu component that changes behavior based on screen size
 */
export function AdaptiveMenu({
  className,
  trigger,
  items,
  position = "bottom-right",
  drawerOnMobile = true,
  breakpoint = "md",
  width = "200px",
  ...props
}: AdaptiveMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Update layout on window resize
  useEffect(() => {
    const checkWidth = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      };
      
      setIsMobile(window.innerWidth < breakpoints[breakpoint] && drawerOnMobile);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, [breakpoint, drawerOnMobile]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  // Handle item click
  const handleItemClick = (item: typeof items[0]) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    setIsOpen(false);
  };
  
  // Position classes
  const getPositionClasses = () => {
    if (isMobile) return "bottom-0 inset-x-0 rounded-t-xl";
    
    switch (position) {
      case "bottom-left":
        return "top-full left-0 mt-1";
      case "bottom-right":
        return "top-full right-0 mt-1";
      case "top-left":
        return "bottom-full left-0 mb-1";
      case "top-right":
        return "bottom-full right-0 mb-1";
      default:
        return "top-full right-0 mt-1";
    }
  };
  
  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay for mobile */}
            {isMobile && (
              <motion.div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />
            )}
            
            <motion.div
              className={cn(
                "z-50 min-w-[8rem] overflow-hidden bg-popover text-popover-foreground shadow-md border",
                isMobile ? "fixed" : "absolute",
                isMobile ? "w-full max-h-[66vh]" : "rounded-md",
                getPositionClasses(),
                className
              )}
              style={{ width: isMobile ? undefined : width }}
              initial={isMobile ? { y: 100, opacity: 0 } : { scale: 0.95, opacity: 0 }}
              animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={isMobile ? { y: 100, opacity: 0 } : { scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              {...props}
            >
              {isMobile && (
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="font-medium">Menu</div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <CloseIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <ScrollArea className={isMobile ? "max-h-[50vh]" : undefined}>
                <div className="p-1">
                  {items.map((item, index) => (
                    <React.Fragment key={index}>
                      {item.divider && <div className="my-1 h-px bg-muted" />}
                      {!item.divider && (
                        item.href ? (
                          <a
                            href={item.disabled ? undefined : item.href}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                              item.disabled ? "pointer-events-none opacity-50" : "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                              item.danger && "text-destructive",
                              isMobile && "px-4 py-2.5 text-base"
                            )}
                            onClick={() => !item.disabled && setIsOpen(false)}
                          >
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.label}
                          </a>
                        ) : (
                          <button
                            onClick={() => handleItemClick(item)}
                            className={cn(
                              "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                              item.disabled ? "pointer-events-none opacity-50" : "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                              item.danger && "text-destructive",
                              isMobile && "px-4 py-2.5 text-base"
                            )}
                            disabled={item.disabled}
                          >
                            {item.icon && <span className="mr-2">{item.icon}</span>}
                            {item.label}
                          </button>
                        )
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Props for AdaptiveTabs component
 */
export interface AdaptiveTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Tabs configuration
   */
  tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  
  /**
   * Default active tab
   */
  defaultTab?: string;
  
  /**
   * Controlled active tab
   */
  activeTab?: string;
  
  /**
   * Tab change handler
   */
  onTabChange?: (id: string) => void;
  
  /**
   * Layout on desktop
   * @default "horizontal"
   */
  layout?: "horizontal" | "vertical";
  
  /**
   * Layout on mobile
   * @default "accordion"
   */
  mobileLayout?: "horizontal" | "accordion" | "dropdown";
  
  /**
   * Breakpoint at which to switch to mobile layout
   * @default "md"
   */
  breakpoint?: "sm" | "md" | "lg" | "xl";
  
  /**
   * Whether to animate tab transitions
   * @default true
   */
  animated?: boolean;
}

/**
 * Adaptive tabs component that changes layout based on screen size
 */
export function AdaptiveTabs({
  className,
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  layout = "horizontal",
  mobileLayout = "accordion",
  breakpoint = "md",
  animated = true,
  ...props
}: AdaptiveTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : ""));
  const [openAccordion, setOpenAccordion] = useState<string | null>(tabs.length > 0 ? tabs[0].id : null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Use controlled tab if provided
  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : activeTab;
  
  // Find active tab object
  const activeTabObject = tabs.find(tab => tab.id === currentTab);
  
  // Update layout on window resize
  useEffect(() => {
    const checkWidth = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      };
      
      setIsMobile(window.innerWidth < breakpoints[breakpoint]);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, [breakpoint]);
  
  // Handle tab change
  const handleTabChange = (id: string) => {
    if (onTabChange) {
      onTabChange(id);
    } else {
      setActiveTab(id);
    }
    
    if (mobileLayout === "accordion") {
      setOpenAccordion(openAccordion === id ? null : id);
    }
    
    setIsDropdownOpen(false);
  };
  
  // Toggle accordion
  const toggleAccordion = (id: string) => {
    if (mobileLayout === "accordion") {
      setOpenAccordion(openAccordion === id ? null : id);
    }
  };
  
  // Render tab content with optional animation
  const renderTabContent = (tab: typeof tabs[0]) => {
    if (mobileLayout === "accordion" && isMobile) {
      return (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: openAccordion === tab.id ? "auto" : 0,
            opacity: openAccordion === tab.id ? 1 : 0
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-4 pt-2 border-t">
            {tab.content}
          </div>
        </motion.div>
      );
    }
    
    if (animated) {
      return (
        <Transition
          isVisible={currentTab === tab.id}
          variant="fade"
          duration={0.2}
          className="h-full w-full"
        >
          {tab.content}
        </Transition>
      );
    }
    
    return currentTab === tab.id ? tab.content : null;
  };
  
  return (
    <div
      className={cn(
        "w-full",
        layout === "vertical" && !isMobile && "flex gap-4",
        className
      )}
      {...props}
    >
      {/* Mobile Accordion Layout */}
      {isMobile && mobileLayout === "accordion" ? (
        <div className="border rounded-lg divide-y">
          {tabs.map((tab) => (
            <div key={tab.id} className="overflow-hidden">
              <button
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors",
                  tab.disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted/50",
                  openAccordion === tab.id && "bg-muted/50"
                )}
                onClick={() => !tab.disabled && toggleAccordion(tab.id)}
                disabled={tab.disabled}
              >
                <div className="flex items-center">
                  {tab.icon && <span className="mr-2">{tab.icon}</span>}
                  {tab.label}
                </div>
                {openAccordion === tab.id ? (
                  <ChevronUp className="h-4 w-4 opacity-70" />
                ) : (
                  <ChevronDown className="h-4 w-4 opacity-70" />
                )}
              </button>
              {!tab.disabled && renderTabContent(tab)}
            </div>
          ))}
        </div>
      ) : isMobile && mobileLayout === "dropdown" ? (
        /* Mobile Dropdown Layout */
        <div className="space-y-2">
          <div className="relative">
            <button
              className="flex w-full items-center justify-between rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center">
                {activeTabObject?.icon && <span className="mr-2">{activeTabObject.icon}</span>}
                {activeTabObject?.label || "Select a tab"}
              </div>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className="absolute top-full left-0 z-10 mt-1 w-full rounded-md border bg-popover shadow-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={cn(
                        "flex w-full items-center px-4 py-2 text-left text-sm transition-colors",
                        tab.disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted",
                        currentTab === tab.id && "bg-muted font-medium"
                      )}
                      onClick={() => !tab.disabled && handleTabChange(tab.id)}
                      disabled={tab.disabled}
                    >
                      {tab.icon && <span className="mr-2">{tab.icon}</span>}
                      {tab.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="rounded-md border p-4">
            {tabs.map((tab) => renderTabContent(tab))}
          </div>
        </div>
      ) : (
        /* Desktop Layouts (or mobile horizontal) */
        <>
          {/* Tab List */}
          <div 
            className={cn(
              layout === "vertical" && !isMobile ? "flex flex-col space-y-1 w-[200px] shrink-0" : "flex border-b space-x-1",
              "overflow-x-auto pb-0.5"
            )}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "flex items-center px-3 py-1.5 text-sm font-medium transition-colors",
                  layout === "vertical" && !isMobile ? "justify-start border-l-2 rounded-r-md" : "justify-center border-b-2 -mb-px",
                  currentTab === tab.id 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                  tab.disabled && "pointer-events-none opacity-50"
                )}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className={cn(
            "mt-2 flex-1",
            layout === "vertical" && !isMobile && "mt-0"
          )}>
            {tabs.map((tab) => renderTabContent(tab))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Props for AdaptiveDisclosure component
 */
export interface AdaptiveDisclosureProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Disclosure title/summary
   */
  title: React.ReactNode;
  
  /**
   * Optional icon for the disclosure button
   */
  icon?: React.ReactNode;
  
  /**
   * Whether to start expanded
   * @default false
   */
  defaultOpen?: boolean;
  
  /**
   * Controlled open state
   */
  open?: boolean;
  
  /**
   * Open state change handler
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * Whether to display disclosure as a card
   * @default true
   */
  asCard?: boolean;
}

/**
 * Adaptive disclosure component for expandable content
 */
export function AdaptiveDisclosure({
  className,
  children,
  title,
  icon,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  asCard = true,
  ...props
}: AdaptiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Use controlled state if provided
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  
  // Toggle disclosure
  const toggle = () => {
    const newState = !open;
    
    if (onOpenChange) {
      onOpenChange(newState);
    } else {
      setIsOpen(newState);
    }
  };
  
  return (
    <div
      className={cn(
        asCard && "border rounded-lg overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Header */}
      <button
        className={cn(
          "flex w-full items-center justify-between px-4 py-3 text-left font-medium transition-colors focus:outline-none",
          open ? "bg-muted/50" : "hover:bg-muted/20",
          asCard ? "" : "rounded-lg hover:bg-muted"
        )}
        onClick={toggle}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
          <span>{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 opacity-70" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 opacity-70" />
        )}
      </button>
      
      {/* Content */}
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className={asCard ? "p-4 border-t" : "pt-2 pb-4 px-2"}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Props for AdaptiveGrid component
 */
export interface AdaptiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Items to display in the grid
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
   * Layout type when in compact view
   * @default "list"
   */
  compactLayout?: "list" | "grid" | "carousel";
  
  /**
   * Whether to add animation to items
   * @default false
   */
  animated?: boolean;
}

/**
 * Adaptive grid component that changes layout based on screen size
 */
export function AdaptiveGrid({
  className,
  items,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = "gap-4 md:gap-6",
  compactLayout = "list",
  animated = false,
  ...props
}: AdaptiveGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Update layout on window resize
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    }
  };
  
  // Generate grid columns classes
  const gridColumnsClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(" ");
  
  // Carousel handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (compactLayout !== 'carousel' || !isMobile) return;
    
    setIsDragging(true);
    setDragStartX('touches' in e 
      ? e.touches[0].clientX 
      : e.clientX
    );
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || compactLayout !== 'carousel' || !isMobile || !carouselRef.current) return;
    
    const currentX = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    const diff = dragStartX - currentX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeSlide < items.length - 1) {
        setActiveSlide(activeSlide + 1);
      } else if (diff < 0 && activeSlide > 0) {
        setActiveSlide(activeSlide - 1);
      }
      setIsDragging(false);
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Carousel navigation
  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };
  
  const nextSlide = () => {
    if (activeSlide < items.length - 1) {
      setActiveSlide(activeSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };
  
  // Render based on layout
  if (isMobile && compactLayout === 'list') {
    return (
      <motion.div
        className={cn("flex flex-col", gap, className)}
        {...props}
        variants={animated ? containerVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            variants={animated ? itemVariants : undefined}
          >
            {item}
          </motion.div>
        ))}
      </motion.div>
    );
  }
  
  if (isMobile && compactLayout === 'carousel') {
    return (
      <div className={cn("relative", className)} {...props}>
        <div
          ref={carouselRef}
          className="overflow-hidden touch-pan-y"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <motion.div
            className="flex"
            animate={{ x: `calc(-${activeSlide * 100}%)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 px-4"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Carousel Controls */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            disabled={activeSlide === 0}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          
          <div className="flex items-center gap-1">
            {items.map((_, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 w-2 rounded-full p-0 bg-foreground/20",
                  activeSlide === index && "bg-primary"
                )}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            disabled={activeSlide === items.length - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Default grid display
  return (
    <motion.div
      className={cn("grid", gridColumnsClasses, gap, className)}
      {...props}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={animated ? itemVariants : undefined}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}