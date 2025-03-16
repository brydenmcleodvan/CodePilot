
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export const FamilyTree = () => {
  const { data: connections } = useQuery({
    queryKey: ['/api/connections'],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Health Tree</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections?.map((connection: any) => (
            <div key={connection.id} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <i className="ri-user-heart-line text-primary text-xl"></i>
                </div>
                <div>
                  <h4 className="font-medium">{connection.name}</h4>
                  <p className="text-sm text-gray-600">{connection.relationshipSpecific}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
