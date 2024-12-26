import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmailTest = () => {
  const { toast } = useToast();

  const sendTestEmail = async () => {
    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to send test emails",
          variant: "destructive",
        });
        return;
      }

      // Get user's profile with email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, notification_enabled')
        .eq('id', user.id)
        .single();

      if (!profile?.notification_enabled || !profile?.email) {
        toast({
          title: "Error",
          description: "Email notifications are not enabled or email is not set",
          variant: "destructive",
        });
        return;
      }

      // Send test email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: profile.email,
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