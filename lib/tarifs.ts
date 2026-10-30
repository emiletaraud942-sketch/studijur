// Grille tarifaire et modèle d'accès — décision d'Émile du 29/10/2026.
//
// Jusqu'à BASCULE_FREEMIUM, rien ne change pour les élèves : l'essai gratuit
// (10 jours, prolongé jusqu'au CC) promis aux promos d'octobre reste tenu
// jusqu'aux CC des 5 et 6 novembre. À partir de cette date :
//   - plus d'essai pour les nouveaux comptes, ni de prolongation jusqu'au
//     prochain CC pour personne : sinon chaque nouvelle date d'examen
//     ajoutée dans lib/revision-cc-config.ts rouvrirait l'accès complet
//     gratuit pile au moment où les élèves sont prêts à payer ;
//   - une leçon nouvelle par jour reste gratuite pour toujours (l'habitude
//     des « 5 minutes par jour » et les rappels qui vont avec) ;
//   - le reste (leçons illimitées, révision CC, révision intensive, cas
//     pratiques, imports) passe par le pass 7 jours ou un abonnement.
export const BASCULE_FREEMIUM = new Date("2026-11-07T00:00:00+01:00").getTime();

export function apresBascule(now = Date.now()): boolean {
  return now >= BASCULE_FREEMIUM;
}

// Pass partiels : paiement unique, aucune reconduction. Un second achat
// pendant un pass encore valide prolonge à partir de la fin du premier
// (voir le webhook Stripe), jamais à partir d'aujourd'hui.
export const PASS_JOURS = 7;

// Leçons nouvelles par jour pour un compte gratuit, une fois l'essai fini.
export const LECONS_GRATUITES_PAR_JOUR = 1;

export type Formule = "pass" | "monthly" | "annual";

// Prix affichés tant que /api/prix n'a pas répondu, ou s'il ne peut pas lire
// les prix chez Stripe. Les montants réellement débités sont ceux des prix
// Stripe (STRIPE_PRICE_ID_*) : /api/prix les relit pour que la page
// /abonnement affiche toujours ce que Stripe facturera vraiment.
export const PRIX_PAR_DEFAUT: Record<Formule, number> = {
  pass: 490,
  monthly: 990,
  annual: 5900,
};

export function euros(centimes: number): string {
  const e = centimes / 100;
  return `${Number.isInteger(e) ? e : e.toFixed(2).replace(".", ",")} €`;
}
