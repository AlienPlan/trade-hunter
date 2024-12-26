import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  emailNotifications: boolean;
  telegramNotifications: boolean;
  onEmailChange: (checked: boolean) => void;
  onTelegramChange: (checked: boolean) => void;
}

export const NotificationSettings = ({
  emailNotifications,
  telegramNotifications,
  onEmailChange,
  onTelegramChange,
}: NotificationSettingsProps) => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive notifications.",
        variant: "destructive",
      });
      return;
    }

    // Save email to localStorage
    localStorage.setItem("notificationEmail", email);
    toast({
      title: "Email Saved",
      description: "You will receive notifications at this email address.",
    });
  };

  return (
    <div className="space-y-4 bg-secondary/20 p-4 rounded-lg">
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={onEmailChange}
          />
          <Label htmlFor="email-notifications">Email Notifications</Label>
        </div>

        {emailNotifications && (
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Button type="submit" variant="secondary" size="sm">
              Save Email
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="telegram-notifications"
            checked={telegramNotifications}
            onCheckedChange={onTelegramChange}
          />
          <Label htmlFor="telegram-notifications">Telegram Notifications</Label>
        </div>
      </form>
    </div>
  );
};