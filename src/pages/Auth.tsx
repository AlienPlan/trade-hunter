import { NotificationSettings } from "@/components/TradingScanner/NotificationSettings";
import { useState } from "react";

const AuthPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [telegramNotifications, setTelegramNotifications] = useState(false);

  return (
    <div className="container mx-auto max-w-md p-4 space-y-8">
      <div className="bg-card p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Trade Hunter Settings</h1>
        <NotificationSettings
          emailNotifications={emailNotifications}
          telegramNotifications={telegramNotifications}
          onEmailChange={setEmailNotifications}
          onTelegramChange={setTelegramNotifications}
        />
      </div>
    </div>
  );
};

export default AuthPage;