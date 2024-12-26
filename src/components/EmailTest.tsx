import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const EmailTest = () => {
  const { toast } = useToast();

  const sendTestEmail = async () => {
    try {
      // Send test email directly without auth
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "alientrading007@gmail.com",
          subject: "Trade Hunter Test Email",
          text: "This is a test email from Trade Hunter. If you received this, your email notifications are working correctly!",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send test email");
      }

      toast({
        title: "Success",
        description: "Test email sent successfully!",
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={sendTestEmail} variant="outline" className="w-full">
      Send Test Email
    </Button>
  );
};