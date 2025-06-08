import { Messenger } from "@/components/messenger";

export function MessengerPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Messenger</h1>
      <Messenger />
    </div>
  );
}

export default MessengerPage;