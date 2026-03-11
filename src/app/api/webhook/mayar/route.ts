import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, MayarWebhookPayload } from '@/lib/mayar';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role for admin writes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity
    const webhookToken = request.headers.get('x-callback-token') || request.headers.get('x-mayar-token');
    if (!verifyWebhookSignature(webhookToken)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: MayarWebhookPayload = await request.json();
    console.log('Mayar webhook received:', JSON.stringify(payload, null, 2));

    // Handle payment.received event
    if (payload.event === 'payment.received') {
      const { id, status, amount, customerEmail } = payload.data;

      if (status === 'active' || status === 'paid' || status === 'completed') {
        const supabase = getSupabaseAdmin();

        // Upsert into pro_subscriptions
        const { error } = await supabase
          .from('pro_subscriptions')
          .upsert(
            {
              mayar_transaction_id: id,
              status: 'active',
              plan_type: 'lifetime',
              amount: amount,
              email: customerEmail || null,
              paid_at: new Date().toISOString(),
            },
            { onConflict: 'mayar_transaction_id' }
          );

        if (error) {
          console.error('Supabase upsert error:', error);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        console.log(`Pro subscription activated for transaction ${id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mayar may send GET to verify endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
