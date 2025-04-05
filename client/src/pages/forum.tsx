import { MessageSquare } from "lucide-react";

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Public Forum</h1>
      </div>

      <p className="text-lg mb-8">
        Join discussions about health trends, fitness tips, and preventive care.
      </p>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Health Discussion Topic {i}</h2>
            <p className="text-muted-foreground mb-4">
              This is a sample discussion topic about health and wellness.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Posted by: User{i}</span>
              <span>•</span>
              <span>Comments: {i * 5}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}