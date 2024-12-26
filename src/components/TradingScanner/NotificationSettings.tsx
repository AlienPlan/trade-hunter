import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, notification_enabled')
        .single();

      if (profile) {
        setEmail(profile.email || '');
        onEmailChange(profile.notification_enabled || false);
      }
    };

    loadProfile();
  }, [onEmailChange]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to receive notifications.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        email: email,
        notification_enabled: emailNotifications,
      });

    if (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Settings Updated",
      description: "Your notification settings have been saved.",
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