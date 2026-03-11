/**
 * Mayar Payment Gateway API Client
 * Docs: https://docs.mayar.id/api-reference/introduction
 */

const MAYAR_API_KEY = process.env.MAYAR_API_KEY || '';
const MAYAR_BASE_URL = process.env.MAYAR_BASE_URL || 'https://api.mayar.id/hl/v1';
const MAYAR_WEBHOOK_SECRET = process.env.MAYAR_WEBHOOK_SECRET || '';

const headers = {
  Authorization: `Bearer ${MAYAR_API_KEY}`,
  'Content-Type': 'application/json',
};

// ===== TYPES =====

export interface MayarPaymentRequest {
  name: string;
  amount: number;
  description?: string;
  redirectUrl?: string;
  mobile?: string;
  email?: string;
}

export interface MayarPaymentResponse {
  statusCode: number;
  message: string;
  data?: {
    id: string;
    link: string;
    status: string;
    amount: number;
    [key: string]: unknown;
  };
}

export interface MayarWebhookPayload {
  event: string;
  data: {
    id: string;
    status: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    [key: string]: unknown;
  };
}

// ===== API FUNCTIONS =====

/**
 * Create a single payment request via Mayar API.
 * Returns the payment link URL that the user should be redirected to.
 */
export async function createPaymentLink(
  params: MayarPaymentRequest
): Promise<MayarPaymentResponse> {
  const response = await fetch(`${MAYAR_BASE_URL}/payment/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: params.name,
      amount: params.amount,
      description: params.description || '',
      redirectUrl: params.redirectUrl || '',
      mobile: params.mobile || '',
      email: params.email || '',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mayar API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Verify that a webhook payload is authentic.
 * Checks the webhook token/secret sent by Mayar.
 */
export function verifyWebhookSignature(
  receivedToken: string | null
): boolean {
  if (!MAYAR_WEBHOOK_SECRET) {
    console.warn('MAYAR_WEBHOOK_SECRET not set — skipping verification');
    return true; // Allow in dev/sandbox
  }
  return receivedToken === MAYAR_WEBHOOK_SECRET;
}

/**
 * Register a webhook URL with Mayar.
 * Call this once during setup.
 */
export async function registerWebhook(urlHook: string): Promise<unknown> {
  const response = await fetch(`${MAYAR_BASE_URL}/webhook/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ urlHook }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mayar webhook register error: ${errorText}`);
  }

  return response.json();
}
