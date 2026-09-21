const apiKey = process.env.BREVO_API_KEY;
const expediteur = process.env.BREVO_SENDER_EMAIL ?? "contact@studijur.fr";

export const brevoConfigured = Boolean(apiKey);

// Envoi best-effort : un email de notification qui échoue ne doit jamais faire
// échouer l'action qui l'a déclenché (ici, l'envoi d'une suggestion). On
// renvoie juste un booléen plutôt que de lever une erreur.
export async function envoyerEmail(params: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { email: expediteur, name: "StudiJur" },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
