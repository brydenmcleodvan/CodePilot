import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ConnectHealthDataButton() {
6  export default function ConnectHealthDataButton() {
7    const [open, setOpen] = useState(false);
8    const [selectedProvider, setSelectedProvider] = useState<HealthProvider | null>(null);
9
10   function handleConnect(provider: HealthProvider) {
11     setSelectedProvider(provider);
12     connectHealthData(provider.id);
13   }
14
15   function connectHealthData(providerId: string) {
16     const oauthMap: Record<string, string> = {
17       apple: 'apple-health',
18       google: 'google-fit',
19       fitbit: 'fitbit',
20     };
21
22     const route = oauthMap[providerId];
23     if (route) {
24       window.location.href = `/api/oauth/${route}`;
25       return;
26     }
27
28     // Fallback for providers without OAuth yet
29     alert(`Connecting your health data for personal management from ${providerId}...`);
30     setTimeout(() => setOpen(false), 1500);
31   }
32
33   return (
34     <>
35       <Button
36         onClick={() => setOpen(true)}
37         className="bg-primary hover:bg-primary/90 text-white"
38       >
39         <i className="ri-heart-pulse-line mr-2" aria-hidden="true" />
40         Connect Health Data
41       </Button>
42
43       <Dialog open={open} onOpenChange={setOpen}>
44         <DialogContent className="sm:max-w-[600px]">
45           <DialogHeader>
46             <DialogTitle className="text-2xl font-semibold">Connect Your Health Data</DialogTitle>
47             <DialogDescription>
48               Link your health devices and apps to get personalized insights. Your data is secure and private.
49             </DialogDescription>
50           </DialogHeader>
51
52           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
53             {providers.map((provider) => (
54               <Card
55                 key={provider.id}
56                 className="cursor-pointer hover:border-primary transition-colors duration-200"
57                 onClick={() => handleConnect(provider)}
58               >
59                 <CardHeader className="pb-2">
60                   <div className="flex items-center justify-between">
61                     <CardTitle className="text-lg">{provider.name}</CardTitle>
62                     <i className={`${provider.logo} text-2xl text-primary`} aria-hidden="true" />
63                   </div>
64                 </CardHeader>
65                 <CardContent>
66                   <CardDescription>{provider.description}</CardDescription>
67                 </CardContent>
68                 <CardFooter className="pt-1">
69                   <Button
70                     variant="outline"
71                     size="sm"
72                     className="w-full mt-2"
73                     onClick={(e) => {
74                       e.stopPropagation();
75                       handleConnect(provider);
76                     }}
77                   >
78                     Connect
79                   </Button>
80                 </CardFooter>
81               </Card>
82             ))}
83           </div>
84
85           <DialogFooter className="flex flex-col sm:flex-row gap-2">
86             <Button variant="outline" onClick={() => setOpen(false)}>
87               Cancel
88             </Button>
89             <Button variant="ghost" className="flex items-center gap-1">
90               <i className="ri-question-line" />
91               Learn more about data privacy
92             </Button>
93           </DialogFooter>
94         </DialogContent>
95       </Dialog>
96     </>
97   );
98 }
