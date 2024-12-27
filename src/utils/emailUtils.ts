import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";

export const captureChart = async () => {
  try {
    const chartElement = document.getElementById("tradingview_chart");
    if (!chartElement) return null;
    
    const canvas = await html2canvas(chartElement);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error("Error capturing chart:", error);
    return null;
  }
};

export const sendEmailNotification = async (
  title: string, 
  description: string, 
  instrument: string, 
  timeframe: string
) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, notification_enabled')
    .maybeSingle();

  if (!profile?.notification_enabled || !profile?.email) return;

  try {
    const chartImage = await captureChart();
    
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: profile.email,
        subject: `${title} - ${instrument} ${timeframe}`,
        text: `
          ${description}
          Instrument: ${instrument}
          Timeframe: ${timeframe}
          Time: ${new Date().toLocaleString()}
        `,
        attachments: chartImage ? [{
          content: chartImage.split('base64,')[1],
          filename: 'chart.png',
          type: 'image/png',
          disposition: 'attachment'
        }] : []
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email notification");
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
};