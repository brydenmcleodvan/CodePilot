/**
 * Responsive UI Demo Page
 * 
 * A showcase of all responsive components with smooth transitions.
 */

import React, { useState } from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Transition, 
  FadeTransition, 
  SlideTransition, 
  ScaleTransition, 
  FlipTransition,
  StaggerList,
  AnimatedNumber,
  CollapsibleSection,
  AnimatedTabPanel,
  CrossfadeImage,
  ScrollReveal 
} from '@/components/ui/transitions';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  ResponsiveStack,
  ResponsiveColumns,
  ResponsiveSplitView,
  ResponsiveAspectRatio,
  ResponsiveHideShow,
  StaggeredGrid,
  MasonryGrid
} from '@/components/ui/responsive-layout';
import {
  AdaptiveNavbar,
  AdaptiveCard,
  AdaptiveSidebar,
  AdaptiveMenu,
  AdaptiveTabs,
  AdaptiveDisclosure,
  AdaptiveGrid
} from '@/components/ui/adaptive-components';
import {
  Home,
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  LogOut,
  BarChart,
  PieChart,
  LineChart,
  Settings2,
  Search,
  PanelRight,
  PanelLeft,
  Coffee,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Image,
  MoreVertical,
  ChevronRight,
  Info,
  HelpCircle,
  Heart
} from 'lucide-react';

export default function ResponsiveUIDemoPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("transitions");
  
  // Transition demo states
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentImage, setCurrentImage] = useState('/placeholder/image-1.jpg');
  
  // Sidebar demo state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // AdaptiveTabs state
  const [activeAdaptiveTab, setActiveAdaptiveTab] = useState("tab1");
  
  // Mock data for grids
  const mockCards = Array.from({ length: 8 }).map((_, i) => (
    <Card key={i}>
      <CardHeader>
        <CardTitle>Card {i + 1}</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Sample content for demo purposes.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">Action</Button>
      </CardFooter>
    </Card>
  ));
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Responsive UI Components</h1>
        <p className="text-lg text-muted-foreground">
          A showcase of responsive components with smooth transitions
        </p>
      </div>
      
      {/* Main demo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-8">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:flex">
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
            <TabsTrigger value="layouts">Responsive Layouts</TabsTrigger>
            <TabsTrigger value="components">Adaptive Components</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Transitions Demo */}
        <TabsContent value="transitions" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Transitions</CardTitle>
              <CardDescription>
                Predefined transitions for common UI elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Button 
                  onClick={() => setIsVisible(!isVisible)}
                  variant={isVisible ? "default" : "outline"}
                >
                  {isVisible ? "Hide Elements" : "Show Elements"}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Fade */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Fade Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="h-40 flex items-center justify-center">
                    <FadeTransition isVisible={isVisible}>
                      <div className="bg-primary/20 p-6 rounded-lg">
                        Fade transition demo
                      </div>
                    </FadeTransition>
                  </CardContent>
                </Card>
                
                {/* Slide */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Slide Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="h-40 flex items-center justify-center">
                    <SlideTransition isVisible={isVisible} direction="bottom">
                      <div className="bg-primary/20 p-6 rounded-lg">
                        Slide from bottom
                      </div>
                    </SlideTransition>
                  </CardContent>
                </Card>
                
                {/* Scale */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Scale Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="h-40 flex items-center justify-center">
                    <ScaleTransition isVisible={isVisible} direction="up">
                      <div className="bg-primary/20 p-6 rounded-lg">
                        Scale up demo
                      </div>
                    </ScaleTransition>
                  </CardContent>
                </Card>
                
                {/* Flip */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Flip Transition</CardTitle>
                  </CardHeader>
                  <CardContent className="h-40 flex items-center justify-center">
                    <FlipTransition isVisible={isVisible} axis="x">
                      <div className="bg-primary/20 p-6 rounded-lg">
                        Flip transition demo
                      </div>
                    </FlipTransition>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced Transitions</CardTitle>
              <CardDescription>
                Specialized transition components for complex UI patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stagger List */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Stagger List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StaggerList isVisible={isVisible} className="list-none p-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-muted p-3 rounded-md">
                          List item {i + 1}
                        </div>
                      ))}
                    </StaggerList>
                  </CardContent>
                </Card>
                
                {/* Animated Number */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Animated Numbers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold">
                        <AnimatedNumber 
                          value={7842} 
                          formatter={(v) => Math.round(v).toLocaleString()}
                        />
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => setIsVisible(!isVisible)}
                      >
                        {isVisible ? "Reset" : "Animate"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Collapsible Section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Collapsible Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                      >
                        {isCollapsed ? "Expand" : "Collapse"}
                      </Button>
                      
                      <CollapsibleSection isExpanded={!isCollapsed}>
                        <div className="bg-muted p-4 rounded-md">
                          <p>This content smoothly expands and collapses.</p>
                          <p>It handles dynamic height automatically.</p>
                        </div>
                      </CollapsibleSection>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Animated Tab Panel */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Animated Tab Panel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-1 border-b">
                        <button 
                          className={`pb-2 px-4 ${activeAdaptiveTab === 'tab1' ? 'border-b-2 border-primary font-medium' : ''}`}
                          onClick={() => setActiveAdaptiveTab('tab1')}
                        >
                          Tab 1
                        </button>
                        <button 
                          className={`pb-2 px-4 ${activeAdaptiveTab === 'tab2' ? 'border-b-2 border-primary font-medium' : ''}`}
                          onClick={() => setActiveAdaptiveTab('tab2')}
                        >
                          Tab 2
                        </button>
                      </div>
                      
                      <div className="h-32 overflow-hidden">
                        <AnimatedTabPanel 
                          activeTab={activeAdaptiveTab}
                          value="tab1"
                          direction="right"
                        >
                          <div className="bg-muted p-4 rounded-md">
                            <p>This is the content for Tab 1.</p>
                          </div>
                        </AnimatedTabPanel>
                        
                        <AnimatedTabPanel 
                          activeTab={activeAdaptiveTab}
                          value="tab2"
                          direction="right"
                        >
                          <div className="bg-primary/20 p-4 rounded-md">
                            <p>This is the content for Tab 2.</p>
                          </div>
                        </AnimatedTabPanel>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Crossfade Image */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Crossfade Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <CrossfadeImage 
                          src={currentImage} 
                          alt="Demo image"
                          className="rounded-md border" 
                          width="100%" 
                          height="160px"
                        />
                      </div>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentImage('/placeholder/image-1.jpg')}
                        >
                          Image 1
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentImage('/placeholder/image-2.jpg')}
                        >
                          Image 2
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Scroll Reveal */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Scroll Reveal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 overflow-auto border rounded-md p-4">
                      <p className="mb-8">Scroll down to see elements reveal...</p>
                      
                      <ScrollReveal animation="fadeIn" className="mb-8">
                        <div className="bg-muted p-4 rounded-md">
                          <p>This element fades in on scroll.</p>
                        </div>
                      </ScrollReveal>
                      
                      <ScrollReveal animation="slideUp" className="mb-8">
                        <div className="bg-primary/20 p-4 rounded-md">
                          <p>This element slides up on scroll.</p>
                        </div>
                      </ScrollReveal>
                      
                      <ScrollReveal animation="scaleUp">
                        <div className="bg-muted p-4 rounded-md">
                          <p>This element scales up on scroll.</p>
                        </div>
                      </ScrollReveal>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Responsive Layouts Demo */}
        <TabsContent value="layouts" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Responsive Containers</CardTitle>
              <CardDescription>
                Layout containers that adapt to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* ResponsiveContainer */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Container</h3>
                <ResponsiveContainer className="bg-muted p-4 rounded-md">
                  <p className="text-center">This container has responsive padding that changes at different breakpoints.</p>
                </ResponsiveContainer>
              </div>
              
              <Separator />
              
              {/* ResponsiveGrid */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Grid</h3>
                <ResponsiveGrid 
                  columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                  className="bg-muted p-4 rounded-md"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-background p-4 rounded-md border">
                      Grid Item {i + 1}
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>
              
              <Separator />
              
              {/* ResponsiveFlex */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Flex</h3>
                <ResponsiveFlex 
                  direction={{ xs: 'col', md: 'row' }}
                  align="items-center"
                  justify="justify-between"
                  className="bg-muted p-4 rounded-md"
                >
                  <div className="bg-background p-4 rounded-md border w-full md:w-1/3">
                    Flex Item 1
                  </div>
                  <div className="bg-background p-4 rounded-md border w-full md:w-1/3">
                    Flex Item 2
                  </div>
                  <div className="bg-background p-4 rounded-md border w-full md:w-1/3">
                    Flex Item 3
                  </div>
                </ResponsiveFlex>
              </div>
              
              <Separator />
              
              {/* ResponsiveStack */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Stack</h3>
                <ResponsiveStack 
                  className="bg-muted p-4 rounded-md"
                  dividers
                >
                  <div className="bg-background p-4 rounded-md border">
                    Stack Item 1
                  </div>
                  <div className="bg-background p-4 rounded-md border">
                    Stack Item 2
                  </div>
                  <div className="bg-background p-4 rounded-md border">
                    Stack Item 3
                  </div>
                </ResponsiveStack>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced Layout Components</CardTitle>
              <CardDescription>
                More complex layout components for responsive designs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* ResponsiveColumns */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Columns</h3>
                <ResponsiveColumns 
                  columns={{
                    xs: [12],
                    sm: [6, 6],
                    md: [3, 6, 3],
                    lg: [2, 8, 2]
                  }}
                  className="bg-muted p-4 rounded-md"
                >
                  <div className="bg-primary/20 p-4 rounded-md border h-full">
                    Sidebar Left
                  </div>
                  <div className="bg-background p-4 rounded-md border">
                    Main Content Area
                    <p className="text-sm text-muted-foreground mt-2">
                      This layout changes column widths at different breakpoints.
                    </p>
                  </div>
                  <div className="bg-primary/20 p-4 rounded-md border h-full">
                    Sidebar Right
                  </div>
                </ResponsiveColumns>
              </div>
              
              <Separator />
              
              {/* ResponsiveSplitView */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Split View</h3>
                <ResponsiveSplitView 
                  direction="horizontal"
                  mobileDirection="vertical"
                  ratio={[4, 6]}
                  className="bg-muted rounded-md overflow-hidden"
                  left={
                    <div className="bg-primary/20 p-4 h-full">
                      <h3 className="font-medium">Left Content</h3>
                      <p className="text-sm">This could be a sidebar or details panel.</p>
                    </div>
                  }
                  right={
                    <div className="bg-background p-4 h-full">
                      <h3 className="font-medium">Right Content</h3>
                      <p className="text-sm">This could be the main content area.</p>
                    </div>
                  }
                />
              </div>
              
              <Separator />
              
              {/* ResponsiveAspectRatio */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Aspect Ratio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm mb-2">16:9 Aspect Ratio</p>
                    <ResponsiveAspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                      <div className="flex items-center justify-center h-full bg-primary/20">
                        16:9 Content
                      </div>
                    </ResponsiveAspectRatio>
                  </div>
                  <div>
                    <p className="text-sm mb-2">4:3 Aspect Ratio</p>
                    <ResponsiveAspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
                      <div className="flex items-center justify-center h-full bg-primary/20">
                        4:3 Content
                      </div>
                    </ResponsiveAspectRatio>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* ResponsiveHideShow */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Responsive Show/Hide</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ResponsiveHideShow hideOn={["xs", "sm"]} className="bg-muted p-4 rounded-md">
                    <p>Hidden on mobile (xs, sm), visible on larger screens</p>
                  </ResponsiveHideShow>
                  
                  <ResponsiveHideShow hideOn={["md", "lg", "xl"]} className="bg-primary/20 p-4 rounded-md">
                    <p>Visible on mobile only (hidden on md+)</p>
                  </ResponsiveHideShow>
                  
                  <ResponsiveHideShow showOn={["lg", "xl"]} className="bg-muted p-4 rounded-md">
                    <p>Only visible on large screens (lg, xl)</p>
                  </ResponsiveHideShow>
                </div>
              </div>
              
              <Separator />
              
              {/* StaggeredGrid */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Staggered Grid</h3>
                <StaggeredGrid 
                  items={Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-muted p-4 rounded-md border">
                      Staggered Item {i + 1}
                    </div>
                  ))}
                  columns={{ xs: 1, sm: 2, md: 3 }}
                />
              </div>
              
              <Separator />
              
              {/* MasonryGrid */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Masonry Grid</h3>
                <MasonryGrid 
                  items={[
                    <div key={1} className="bg-primary/10 p-4 rounded-md border h-40">Item 1</div>,
                    <div key={2} className="bg-primary/20 p-4 rounded-md border h-64">Item 2</div>,
                    <div key={3} className="bg-primary/10 p-4 rounded-md border h-32">Item 3</div>,
                    <div key={4} className="bg-primary/20 p-4 rounded-md border h-48">Item 4</div>,
                    <div key={5} className="bg-primary/10 p-4 rounded-md border h-56">Item 5</div>,
                    <div key={6} className="bg-primary/20 p-4 rounded-md border h-40">Item 6</div>
                  ]}
                  columns={{ xs: 1, sm: 2, md: 3 }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Adaptive Components Demo */}
        <TabsContent value="components" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Navigation Components</CardTitle>
              <CardDescription>
                Navigation components that adapt to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* AdaptiveNavbar */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Adaptive Navbar</h3>
                <div className="border rounded-lg overflow-hidden">
                  <AdaptiveNavbar
                    brand={<span className="text-xl font-bold">Logo</span>}
                    items={[
                      { label: "Home", href: "#", icon: <Home className="h-4 w-4" /> },
                      { label: "Dashboard", href: "#", icon: <BarChart className="h-4 w-4" /> },
                      { 
                        label: "Settings", 
                        icon: <Settings className="h-4 w-4" />,
                        children: [
                          { label: "Profile", href: "#", icon: <User className="h-4 w-4" /> },
                          { label: "Notifications", href: "#", icon: <Bell className="h-4 w-4" /> },
                          { label: "Theme", href: "#", icon: <Moon className="h-4 w-4" /> }
                        ]
                      },
                    ]}
                    actions={
                      <Button size="sm" variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Button>
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This navbar switches between desktop and mobile layouts based on screen size.
                </p>
              </div>
              
              <Separator />
              
              {/* AdaptiveSidebar */}
              <div className="space-y-2 relative">
                <h3 className="text-lg font-medium">Adaptive Sidebar</h3>
                <div className="flex">
                  <Button 
                    onClick={() => setIsSidebarOpen(true)}
                    variant="outline"
                  >
                    <PanelLeft className="h-4 w-4 mr-2" />
                    Toggle Sidebar
                  </Button>
                </div>
                
                <div className="relative border rounded-lg h-64 overflow-hidden mt-4">
                  <AdaptiveSidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    position="left"
                    width="240px"
                    header={
                      <div className="flex items-center">
                        <span className="font-medium">Sidebar</span>
                      </div>
                    }
                    footer={
                      <Button variant="outline" size="sm" className="w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </Button>
                    }
                  >
                    <div className="space-y-1">
                      <button className="flex items-center w-full p-2 rounded-md hover:bg-muted transition-colors">
                        <Home className="h-4 w-4 mr-3" />
                        <span>Home</span>
                      </button>
                      <button className="flex items-center w-full p-2 rounded-md hover:bg-muted transition-colors">
                        <BarChart className="h-4 w-4 mr-3" />
                        <span>Dashboard</span>
                      </button>
                      <button className="flex items-center w-full p-2 rounded-md hover:bg-muted transition-colors">
                        <User className="h-4 w-4 mr-3" />
                        <span>Profile</span>
                      </button>
                      <button className="flex items-center w-full p-2 rounded-md hover:bg-muted transition-colors">
                        <Settings className="h-4 w-4 mr-3" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </AdaptiveSidebar>
                  
                  <div className="p-4 md:pl-[240px] transition-all duration-200">
                    <p>Main content area</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      The sidebar can be fixed or overlay content based on screen size.
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* AdaptiveMenu */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Adaptive Menu</h3>
                <div className="flex justify-center">
                  <AdaptiveMenu
                    trigger={
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Options
                        <ChevronRight className="h-4 w-4 ml-2 rotate-90" />
                      </Button>
                    }
                    items={[
                      { label: "Profile", href: "#", icon: <User className="h-4 w-4" /> },
                      { label: "Settings", href: "#", icon: <Settings className="h-4 w-4" /> },
                      { label: "", divider: true },
                      { label: "Help", href: "#", icon: <HelpCircle className="h-4 w-4" /> },
                      { label: "Log Out", href: "#", icon: <LogOut className="h-4 w-4" />, danger: true }
                    ]}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  This menu adapts to mobile by showing as a bottom sheet.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Content Components</CardTitle>
              <CardDescription>
                Content display components that adapt to different screen sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* AdaptiveCard */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Adaptive Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AdaptiveCard
                    title="Default Card"
                    description="A basic card layout"
                    media={
                      <div className="bg-muted w-full h-40 flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    }
                    footer="Card footer"
                    actions={
                      <Button size="sm">Action</Button>
                    }
                  >
                    <p>Card content goes here.</p>
                  </AdaptiveCard>
                  
                  <AdaptiveCard
                    title="Horizontal Card"
                    description="Changes to vertical on mobile"
                    variant="horizontal"
                    media={
                      <div className="bg-primary/20 w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    }
                    footer="Card footer"
                    actions={
                      <Button size="sm">Action</Button>
                    }
                  >
                    <p>This card is horizontal on desktop but vertical on mobile.</p>
                  </AdaptiveCard>
                  
                  <AdaptiveCard
                    title="Compact Card"
                    description="Smaller padding, more condensed"
                    variant="compact"
                    actions={
                      <Button size="sm" variant="outline">View</Button>
                    }
                  >
                    <p>Compact card with less padding.</p>
                  </AdaptiveCard>
                  
                  <AdaptiveCard
                    title="Featured Card"
                    description="With overlay text on image"
                    variant="featured"
                    media={
                      <div className="bg-muted w-full h-full flex items-center justify-center">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    }
                    clickable
                    href="#"
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* AdaptiveTabs */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Adaptive Tabs</h3>
                <div className="border rounded-lg overflow-hidden">
                  <AdaptiveTabs
                    tabs={[
                      {
                        id: "tab1",
                        label: "Dashboard",
                        icon: <BarChart className="h-4 w-4" />,
                        content: (
                          <div className="p-4">
                            <h3 className="font-medium mb-2">Dashboard Content</h3>
                            <p>This is the content for the Dashboard tab.</p>
                          </div>
                        )
                      },
                      {
                        id: "tab2",
                        label: "Analytics",
                        icon: <LineChart className="h-4 w-4" />,
                        content: (
                          <div className="p-4">
                            <h3 className="font-medium mb-2">Analytics Content</h3>
                            <p>This is the content for the Analytics tab.</p>
                          </div>
                        )
                      },
                      {
                        id: "tab3",
                        label: "Reports",
                        icon: <PieChart className="h-4 w-4" />,
                        content: (
                          <div className="p-4">
                            <h3 className="font-medium mb-2">Reports Content</h3>
                            <p>This is the content for the Reports tab.</p>
                          </div>
                        )
                      },
                    ]}
                    layout="horizontal"
                    mobileLayout="accordion"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  These tabs change to an accordion on mobile devices.
                </p>
              </div>
              
              <Separator />
              
              {/* AdaptiveDisclosure */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Adaptive Disclosure</h3>
                <div className="space-y-2">
                  <AdaptiveDisclosure
                    title="What are adaptive components?"
                    icon={<Info className="h-4 w-4" />}
                  >
                    <p>
                      Adaptive components automatically change their layout and behavior
                      based on the screen size they're viewed on. This creates a seamless
                      experience across all devices.
                    </p>
                  </AdaptiveDisclosure>
                  
                  <AdaptiveDisclosure
                    title="How to use these components?"
                    icon={<HelpCircle className="h-4 w-4" />}
                    defaultOpen
                  >
                    <p>
                      Import the components you need from their respective module.
                      Configure the props according to your needs, and the components
                      will handle the responsiveness automatically.
                    </p>
                    <pre className="bg-muted p-2 rounded-md text-xs mt-2">
                      {`import { AdaptiveCard } from '@/components/ui/adaptive-components';`}
                    </pre>
                  </AdaptiveDisclosure>
                </div>
              </div>
              
              <Separator />
              
              {/* AdaptiveGrid */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Adaptive Grid</h3>
                <AdaptiveGrid
                  items={Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-muted p-4 rounded-md border">
                      <h4 className="font-medium">Item {i + 1}</h4>
                      <p className="text-sm text-muted-foreground">
                        This grid changes layout on mobile.
                      </p>
                    </div>
                  ))}
                  columns={{ xs: 1, sm: 2, md: 3 }}
                  compactLayout="carousel"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This grid changes to a carousel on mobile devices.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}