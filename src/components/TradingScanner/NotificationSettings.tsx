import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmailTest } from "@/components/EmailTest";

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
  return (
    <div className="space-y-4 bg-secondary/20 p-4 rounded-lg">
      <div className="space-y-4">
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
            <EmailTest />
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
      </div>
    </div>
  );
};