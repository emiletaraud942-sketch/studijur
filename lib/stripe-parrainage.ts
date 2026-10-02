import type Stripe from "stripe";

// Coupon fixe, créé une seule fois côté Stripe puis réutilisé (get-or-create,
// voir idCouponParrainage) : pas de configuration manuelle dans le dashboard
// Stripe. Partagé entre /api/checkout (réduction du filleul, visible dès le
// paiement) et le webhook (réduction du parrain, posée sur son customer —
// voir crediterParrainSiBesoin dans /api/stripe/webhook).
export const COUPON_PARRAINAGE_ID = "parrainage-090";
const COUPON_PARRAINAGE_OFF_CENTS = 90;

export async function idCouponParrainage(stripe: Stripe): Promise<string> {
  try {
    await stripe.coupons.retrieve(COUPON_PARRAINAGE_ID);
    return COUPON_PARRAINAGE_ID;
  } catch {
    const coupon = await stripe.coupons.create({
      id: COUPON_PARRAINAGE_ID,
      amount_off: COUPON_PARRAINAGE_OFF_CENTS,
      currency: "eur",
      duration: "once",
      name: "Parrainage StudiJur",
    });
    return coupon.id;
  }
}
