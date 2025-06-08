import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNotifications } from '@/lib/notifications';

export default function SystemAlerts() {
  const { alerts } = useNotifications();

  if (!alerts.length) return null;

  return (
    <div className="p-2 space-y-2">
      {alerts.map(alert => (
        <Alert key={alert.id} variant="destructive">
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.content}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
