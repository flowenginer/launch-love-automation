import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface CaptureRequest {
  name?: string;
  email: string;
  phone?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  [key: string]: any; // Para campos adicionais
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract permanent_webhook_id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const permanentWebhookId = pathParts[pathParts.length - 1];
    
    if (!permanentWebhookId) {
      return new Response(
        JSON.stringify({ error: 'Webhook ID is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Processing capture for webhook ID:', permanentWebhookId);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Find the webhook integration by permanent_webhook_id
    const { data: integration, error: integrationError } = await supabase
      .from('webhook_integrations')
      .select('id, launch_id, launches!inner(id, workspace_id)')
      .eq('permanent_webhook_id', permanentWebhookId)
      .eq('is_active', true)
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const launch = integration.launches;

    // Parse request body
    const captureData: CaptureRequest = await req.json();

    if (!captureData.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Build metadata object with UTM parameters
    const metadata = {
      utm_source: captureData.utm_source,
      utm_medium: captureData.utm_medium,
      utm_campaign: captureData.utm_campaign,
      utm_content: captureData.utm_content,
      utm_term: captureData.utm_term,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      user_agent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
      captured_at: new Date().toISOString(),
      // Include any additional fields from the request
      ...Object.fromEntries(
        Object.entries(captureData).filter(([key]) => 
          !['name', 'email', 'phone', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key)
        )
      )
    };

    // Try to insert or update the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .upsert({
        launch_id: launch.id,
        name: captureData.name || null,
        email: captureData.email,
        phone: captureData.phone || null,
        tags: [],
        metadata: metadata
      }, {
        onConflict: 'launch_id,email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Failed to save lead' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Lead captured successfully:', lead.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: 'Lead captured successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in webhook-capture function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);