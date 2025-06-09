/**
 * Skeleton Demo Page
 * 
 * A showcase of all skeleton loading options and how they integrate with services.
 */

import React, { useState } from 'react';
import { 
  CardSkeleton, 
  ChartSkeleton, 
  TableSkeleton, 
  ListSkeleton,
  TextSkeleton,
  CircleSkeleton,
  RectSkeleton,
  FormFieldSkeleton
} from '@/components/ui/skeleton-loader';
import { SkeletonDashboardExample } from '@/components/examples/SkeletonDashboardExample';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SkeletonDemoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [animation, setAnimation] = useState<'pulse' | 'shimmer' | 'wave' | 'none'>('pulse');
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Skeleton Loading Components</h1>
        <p className="text-lg text-muted-foreground">
          A showcase of animated loading skeletons for the service architecture
        </p>
      </div>
      
      <Tabs defaultValue="examples">
        <TabsList className="mb-4">
          <TabsTrigger value="examples">Service Integration</TabsTrigger>
          <TabsTrigger value="components">Component Library</TabsTrigger>
          <TabsTrigger value="animations">Animation Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="examples" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Service Integration Example</CardTitle>
              <CardDescription>
                This example demonstrates how skeleton loaders integrate with our service architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SkeletonDashboardExample />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="components" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Text Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Text Skeleton</CardTitle>
                <CardDescription>
                  For loading text content with multiple lines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Single Line</h3>
                  <TextSkeleton isLoading={isLoading} animation={animation}>
                    This is the actual content that will be shown when loaded.
                  </TextSkeleton>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Multiple Lines</h3>
                  <TextSkeleton 
                    lines={3} 
                    isLoading={isLoading} 
                    animation={animation}
                    width={['100%', '80%', '60%']}
                  >
                    <p>This is the first line of content.</p>
                    <p>This is the second line that will appear when loaded.</p>
                    <p>This is the third line of actual content.</p>
                  </TextSkeleton>
                </div>
              </CardContent>
            </Card>
            
            {/* Circle Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Circle Skeleton</CardTitle>
                <CardDescription>
                  For loading avatars, icons, or circular images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <CircleSkeleton 
                      size="3rem" 
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        JD
                      </div>
                    </CircleSkeleton>
                    <span className="text-xs">Small</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <CircleSkeleton 
                      size="5rem" 
                      isLoading={isLoading} 
                      animation={animation}
                    >
                      <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl">
                        JD
                      </div>
                    </CircleSkeleton>
                    <span className="text-xs">Medium</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <CircleSkeleton 
                      size="8rem" 
                      isLoading={isLoading} 
                      animation={animation}
                    >
                      <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl">
                        JD
                      </div>
                    </CircleSkeleton>
                    <span className="text-xs">Large</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Rectangle Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Rectangle Skeleton</CardTitle>
                <CardDescription>
                  For loading images, banners, or rectangular content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Image Placeholder</h3>
                  <RectSkeleton 
                    width="100%" 
                    height="12rem" 
                    isLoading={isLoading} 
                    animation={animation}
                  >
                    <div className="h-48 w-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">Image Content</span>
                    </div>
                  </RectSkeleton>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Banner</h3>
                  <RectSkeleton 
                    width="100%" 
                    height="4rem" 
                    radius="0.25rem"
                    isLoading={isLoading} 
                    animation={animation}
                  >
                    <div className="h-16 w-full bg-primary flex items-center justify-center text-primary-foreground">
                      Banner Content
                    </div>
                  </RectSkeleton>
                </div>
              </CardContent>
            </Card>
            
            {/* Form Field Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Form Field Skeleton</CardTitle>
                <CardDescription>
                  For loading form inputs and fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <FormFieldSkeleton 
                    hasLabel={true}
                    inputHeight="2.5rem"
                    isLoading={isLoading}
                    animation={animation}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="example-1">Username</Label>
                      <div className="h-10 w-full bg-muted flex items-center px-3 rounded-md">
                        <span className="text-muted-foreground">johndoe</span>
                      </div>
                    </div>
                  </FormFieldSkeleton>
                </div>
                
                <div>
                  <FormFieldSkeleton
                    hasLabel={true}
                    hasError={true}
                    inputHeight="2.5rem"
                    isLoading={isLoading}
                    animation={animation}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="example-2">Password</Label>
                      <div className="h-10 w-full bg-destructive/20 flex items-center px-3 rounded-md">
                        <span className="text-muted-foreground">••••••</span>
                      </div>
                      <p className="text-xs text-destructive">Password must be at least 8 characters</p>
                    </div>
                  </FormFieldSkeleton>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {/* Card Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Card Skeleton</CardTitle>
                <CardDescription>
                  For loading card components with various layouts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Basic Card</h3>
                    <CardSkeleton 
                      hasHeader={true}
                      contentLines={3}
                      hasFooter={false}
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>Actual Card Title</CardTitle>
                          <CardDescription>This is the real card description</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>This is the real content of the card. It would show when the loading is complete.</p>
                        </CardContent>
                      </Card>
                    </CardSkeleton>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">With Image</h3>
                    <CardSkeleton 
                      hasHeader={true}
                      hasImage={true}
                      contentLines={2}
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>Card With Image</CardTitle>
                        </CardHeader>
                        <div className="h-48 bg-muted w-full flex items-center justify-center">
                          <span className="text-muted-foreground">Image</span>
                        </div>
                        <CardContent className="pt-4">
                          <p>Card content below the image</p>
                        </CardContent>
                      </Card>
                    </CardSkeleton>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">With Footer</h3>
                    <CardSkeleton 
                      hasHeader={true}
                      contentLines={2}
                      hasFooter={true}
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>Card With Footer</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>This card has a footer section below</p>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                          <div className="flex justify-between w-full">
                            <span>Created 2 days ago</span>
                            <Button variant="outline" size="sm">Action</Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </CardSkeleton>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Chart Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Skeleton</CardTitle>
                <CardDescription>
                  For loading various types of charts and data visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Bar Chart</h3>
                    <ChartSkeleton 
                      type="bar"
                      height="15rem"
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <div className="h-60 bg-muted w-full flex items-center justify-center">
                        <span className="text-muted-foreground">Bar Chart Content</span>
                      </div>
                    </ChartSkeleton>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Line Chart</h3>
                    <ChartSkeleton 
                      type="line"
                      height="15rem"
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <div className="h-60 bg-muted w-full flex items-center justify-center">
                        <span className="text-muted-foreground">Line Chart Content</span>
                      </div>
                    </ChartSkeleton>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Area Chart</h3>
                    <ChartSkeleton 
                      type="area"
                      height="15rem"
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <div className="h-60 bg-muted w-full flex items-center justify-center">
                        <span className="text-muted-foreground">Area Chart Content</span>
                      </div>
                    </ChartSkeleton>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Donut Chart</h3>
                    <ChartSkeleton 
                      type="donut"
                      height="15rem"
                      isLoading={isLoading}
                      animation={animation}
                    >
                      <div className="h-60 bg-muted w-full flex items-center justify-center">
                        <span className="text-muted-foreground">Donut Chart Content</span>
                      </div>
                    </ChartSkeleton>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Table and List Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Table Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>Table Skeleton</CardTitle>
                  <CardDescription>
                    For loading table data with rows and columns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TableSkeleton 
                    rows={5}
                    columns={3}
                    hasHeader={true}
                    isLoading={isLoading}
                    animation={animation}
                  >
                    <div className="h-60 bg-muted w-full flex items-center justify-center">
                      <span className="text-muted-foreground">Table Content</span>
                    </div>
                  </TableSkeleton>
                </CardContent>
              </Card>
              
              {/* List Skeleton */}
              <Card>
                <CardHeader>
                  <CardTitle>List Skeleton</CardTitle>
                  <CardDescription>
                    For loading list items with optional avatars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Simple List</h3>
                      <ListSkeleton 
                        items={3}
                        linesPerItem={1}
                        isLoading={isLoading}
                        animation={animation}
                      >
                        <div className="h-24 bg-muted w-full flex items-center justify-center">
                          <span className="text-muted-foreground">Simple List Content</span>
                        </div>
                      </ListSkeleton>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">List with Avatars</h3>
                      <ListSkeleton 
                        items={3}
                        hasImage={true}
                        linesPerItem={2}
                        isLoading={isLoading}
                        animation={animation}
                      >
                        <div className="h-36 bg-muted w-full flex items-center justify-center">
                          <span className="text-muted-foreground">List with Avatars Content</span>
                        </div>
                      </ListSkeleton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="animations" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Animation Controls</CardTitle>
              <CardDescription>
                Try different animation styles for the skeleton loaders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-base font-medium">Toggle Loading State</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch between loading and loaded states
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="loading-toggle" className={!isLoading ? "text-primary" : "text-muted-foreground"}>
                    {isLoading ? "Loading" : "Loaded"}
                  </Label>
                  <Switch
                    id="loading-toggle"
                    checked={isLoading}
                    onCheckedChange={setIsLoading}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Animation Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant={animation === 'pulse' ? 'default' : 'outline'}
                    onClick={() => setAnimation('pulse')}
                  >
                    Pulse
                  </Button>
                  <Button 
                    variant={animation === 'shimmer' ? 'default' : 'outline'}
                    onClick={() => setAnimation('shimmer')}
                  >
                    Shimmer
                  </Button>
                  <Button 
                    variant={animation === 'wave' ? 'default' : 'outline'}
                    onClick={() => setAnimation('wave')}
                  >
                    Wave
                  </Button>
                  <Button 
                    variant={animation === 'none' ? 'default' : 'outline'}
                    onClick={() => setAnimation('none')}
                  >
                    None
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pulse Animation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TextSkeleton lines={3} animation="pulse" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Shimmer Animation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TextSkeleton lines={3} animation="shimmer" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Wave Animation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TextSkeleton lines={3} animation="wave" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}