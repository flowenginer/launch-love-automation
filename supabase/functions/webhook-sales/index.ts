import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface SalesWebhookRequest {
  email: string;
  name?: string;
  product?: string;
  amount?: number;
  amount_cents?: number;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  [key: string]: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract platform and launch_code from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const platform = pathParts[pathParts.length - 2]; // e.g., 'hotmart', 'hubla'
    const launchCode = pathParts[pathParts.length - 1];
    
    if (!platform || !launchCode) {
      return new Response(
        JSON.stringify({ error: 'Platform and launch code are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Processing sales webhook for platform:', platform, 'launch:', launchCode);

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
    const salesData: SalesWebhookRequest = await req.json();

    if (!salesData.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Normalize status based on platform
    let normalizedStatus: 'waiting_payment' | 'paid' | 'refunded' | 'abandoned_checkout';
    
    switch (platform.toLowerCase()) {
      case 'hotmart':
        switch (salesData.status?.toLowerCase()) {
          case 'approved':
          case 'complete':
            normalizedStatus = 'paid';
            break;
          case 'waiting_payment':
          case 'pending':
            normalizedStatus = 'waiting_payment';
            break;
          case 'refunded':
          case 'cancelled':
            normalizedStatus = 'refunded';
            break;
          default:
            normalizedStatus = 'waiting_payment';
        }
        break;
      case 'hubla':
      case 'monetizze':
        switch (salesData.status?.toLowerCase()) {
          case 'paid':
          case 'approved':
            normalizedStatus = 'paid';
            break;
          case 'refunded':
            normalizedStatus = 'refunded';
            break;
          case 'abandoned':
            normalizedStatus = 'abandoned_checkout';
            break;
          default:
            normalizedStatus = 'waiting_payment';
        }
        break;
      default:
        normalizedStatus = salesData.status as any || 'waiting_payment';
    }

    // Calculate amount in cents
    let amountCents = 0;
    if (salesData.amount_cents) {
      amountCents = salesData.amount_cents;
    } else if (salesData.amount) {
      amountCents = Math.round(salesData.amount * 100);
    }

    // Try to find existing lead, or create a new one
    let leadId = null;
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('launch_id', launch.id)
      .eq('email', salesData.email)
      .single();

    if (existingLead) {
      leadId = existingLead.id;
    } else {
      // Create a new lead if it doesn't exist
      const { data: newLead, error: leadError } = await supabase
        .from('leads')
        .insert({
          launch_id: launch.id,
          name: salesData.name || null,
          email: salesData.email,
          phone: null,
          tags: ['customer'],
          metadata: {
            source: 'sales_webhook',
            platform: platform,
            created_from_sale: true
          }
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
      } else {
        leadId = newLead.id;
      }
    }

    // Insert or update the sale
    const { data: sale, error: salesError } = await supabase
      .from('sales')
      .upsert({
        lead_id: leadId,
        launch_id: launch.id,
        product_name: salesData.product || 'Produto',
        amount_cents: amountCents,
        status: normalizedStatus,
        payment_method: salesData.payment_method || null,
        platform: platform,
        transaction_id: salesData.transaction_id || null
      }, {
        onConflict: 'transaction_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (salesError) {
      console.error('Error inserting sale:', salesError);
      return new Response(
        JSON.stringify({ error: 'Failed to save sale' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Sale processed successfully:', sale.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sale_id: sale.id,
        lead_id: leadId,
        message: 'Sale processed successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in webhook-sales function:', error);
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