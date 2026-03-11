import { NextRequest, NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/mayar';

// Pro Plan details
const PRO_PLAN = {
  name: 'MyDuit Quest Pro - Lifetime',
  amount: 19000, // Rp 19.000
  description: 'Upgrade ke MyDuit Quest Pro! Unlock semua fitur premium: dekorasi unlimited, scan struk unlimited, avatar premium, dan lainnya.'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, mobile } = body;

    if (!userId || !email || !mobile) {
      return NextResponse.json(
        { error: 'userId, email, dan nomor HP wajib diisi' },
        { status: 400 }
      );
    }

    // Determine redirect URL
    const origin = request.headers.get('origin') || request.headers.get('referer')?.replace(/\/$/, '') || '';
    const redirectUrl = `${origin}/upgrade/success?userId=${encodeURIComponent(userId)}`;

    const result = await createPaymentLink({
      name: PRO_PLAN.name,
      amount: PRO_PLAN.amount,
      description: PRO_PLAN.description,
      redirectUrl,
      email,
      mobile,
    });

    if (!result.data?.link) {
      return NextResponse.json(
        { error: 'Failed to create payment link', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: result.data.link,
      transactionId: result.data.id,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
