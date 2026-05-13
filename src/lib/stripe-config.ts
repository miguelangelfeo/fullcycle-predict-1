/**
 * stripe-config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuración de Stripe para producción.
 *
 * ESTADO ACTUAL: modo local/demo — los pagos son simulados con localStorage.
 *
 * CUANDO TENGAS BACKEND:
 *   1. Crea una cuenta en https://stripe.com y obtén tus claves.
 *   2. Reemplaza VITE_STRIPE_PUBLISHABLE_KEY en tu archivo .env
 *   3. Descomenta loadStripe() y StripeProvider abajo.
 *   4. En tu backend (Cloudflare Worker / Node), instala:
 *        npm install stripe
 *      y crea los endpoints /create-payment-intent y /confirm-payment.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * FLUJO DE INTEGRACIÓN REAL (Stripe):
 *
 *  Frontend                       Backend (Worker/Node)
 *  ─────────                      ─────────────────────
 *  1. User clicks "Pagar"
 *  2. POST /create-payment-intent ──►  stripe.paymentIntents.create({
 *       { amount, currency,             amount: monto * 100,  // centavos
 *         proveedorEmail }              currency: "cop",
 *                           ◄──         metadata: { proveedor, sku }
 *     { clientSecret }            })
 *  3. stripe.confirmCardPayment(
 *       clientSecret,
 *       { payment_method: { card: cardElement } }
 *     )
 *  4. On success → registrarPago() + enviar email
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { loadStripe } from "@stripe/stripe-js";

// Reemplaza con tu clave pública de Stripe cuando tengas backend.
// Para pruebas usa: pk_test_...
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

/**
 * Instancia de Stripe (singleton).
 * Retorna null si no hay clave configurada (modo local).
 */
export const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

export const stripeEnabled = Boolean(STRIPE_PUBLISHABLE_KEY);

/**
 * Monto en centavos para Stripe (COP no usa decimales reales,
 * pero Stripe requiere el valor como integer × 100).
 */
export function toStripeCentavos(monto: number): number {
  return Math.round(monto * 100);
}

/**
 * EJEMPLO DE USO — descomentar cuando haya backend:
 *
 * import { Elements } from "@stripe/react-stripe-js";
 * import { stripePromise } from "@/lib/stripe-config";
 *
 * function PagoWrapper({ clientSecret }: { clientSecret: string }) {
 *   return (
 *     <Elements stripe={stripePromise} options={{ clientSecret }}>
 *       <PagoForm />
 *     </Elements>
 *   );
 * }
 *
 * EJEMPLO DE CLOUDFLARE WORKER (backend/payments.ts):
 *
 * import Stripe from "stripe";
 * const stripe = new Stripe(env.STRIPE_SECRET_KEY);
 *
 * export async function onRequestPost({ request, env }) {
 *   const { monto, proveedorEmail, sku } = await request.json();
 *   const intent = await stripe.paymentIntents.create({
 *     amount: monto * 100,
 *     currency: "cop",
 *     receipt_email: proveedorEmail,
 *     metadata: { sku },
 *   });
 *   return Response.json({ clientSecret: intent.client_secret });
 * }
 */
