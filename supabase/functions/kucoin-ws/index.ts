import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'BTC-USDT';
    const timeframe = url.searchParams.get('timeframe') || '1h';

    const apiKey = Deno.env.get('KUCOIN_API_KEY')
    const apiSecret = Deno.env.get('KUCOIN_API_SECRET')
    const apiPassphrase = Deno.env.get('KUCOIN_API_PASSPHRASE')

    // Get WebSocket token from KuCoin
    const response = await fetch('https://api.kucoin.com/api/v1/bullet-public', {
      method: 'POST',
      headers: {
        'KC-API-KEY': apiKey!,
        'KC-API-SIGN': apiSecret!,
        'KC-API-TIMESTAMP': Date.now().toString(),
        'KC-API-PASSPHRASE': apiPassphrase!,
        'KC-API-VERSION': '2',
      },
    });

    const data = await response.json();

    if (!data.data || !data.data.token) {
      throw new Error('Failed to get WebSocket token');
    }

    return new Response(
      JSON.stringify({
        token: data.data.token,
        endpoint: data.data.instanceServers[0].endpoint,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})