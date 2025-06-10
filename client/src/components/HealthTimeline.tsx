import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, Dna, CalendarCheck } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

const iconMap: Record<string, JSX.Element> = {
  metric: <Activity className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
  genetic_risk: <Dna className="h-4 w-4" />,
  event: <CalendarCheck className="h-4 w-4" />,
};

export default function HealthTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/user/timeline"],
    queryFn: () => apiRequest("GET", "/api/user/timeline").then(res => res.json()),
  });

  const exportPdf = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("timeline.pdf");
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Health Timeline</CardTitle>
        <Button variant="outline" size="sm" onClick={exportPdf}>
          Export PDF
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4" ref={containerRef} id="timeline-container">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {events.map((event: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="p-2 bg-muted rounded">
                    {iconMap[event.type] || <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    {event.value && (
                      <p className="text-sm text-muted-foreground">{String(event.value)}</p>
                    )}
                    <Badge variant="outline" className="mt-1 capitalize">
                      {event.type.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
