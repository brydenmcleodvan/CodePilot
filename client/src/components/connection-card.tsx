import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ConnectionCardProps {
  connection: User;
  relationship: string;
  specific: string;
}

const ConnectionCard = ({ connection, relationship, specific }: ConnectionCardProps) => {
  const { toast } = useToast();

  const handleRemoveConnection = () => {
    toast({
      title: "Connection removed",
      description: `You are no longer connected with ${connection.name}`,
    });
  };

  const handleSendMessage = () => {
    toast({
      title: "Message feature",
      description: "Direct messaging will be available in a future update.",
    });
  };

  const handleViewProfile = () => {
    toast({
      title: "View profile",
      description: "Viewing other user profiles will be available in a future update.",
    });
  };

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors duration-200">
      <img
        src={connection.profilePicture || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
        alt={connection.name}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <h3 className="font-medium">{connection.name}</h3>
        <p className="text-sm text-gray-500">
          {relationship} {specific && `- ${specific}`}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="ml-auto h-8 w-8 p-0 text-gray-400 hover:text-primary"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewProfile}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSendMessage}>
            Send Message
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={handleRemoveConnection}
          >
            Remove Connection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ConnectionCard;
