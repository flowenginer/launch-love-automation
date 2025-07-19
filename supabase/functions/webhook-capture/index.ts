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
    // Extract launch_code from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const launchCode = pathParts[pathParts.length - 1];
    
    if (!launchCode) {
      return new Response(
        JSON.stringify({ error: 'Launch code is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Processing capture for launch code:', launchCode);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Find the launch by launch_code
    const { data: launch, error: launchError } = await supabase
      .from('launches')
      .select('id, workspace_id')
      .eq('launch_code', launchCode)
      .single();

    if (launchError || !launch) {
      console.error('Launch not found:', launchError);
      return new Response(
        JSON.stringify({ error: 'Launch not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

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