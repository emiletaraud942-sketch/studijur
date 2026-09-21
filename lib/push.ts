import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const contact = process.env.VAPID_CONTACT ?? "mailto:contact@studijur.fr";

export const pushConfigured = Boolean(publicKey && privateKey);

let pret = false;

export function getWebPush() {
  if (!pushConfigured) return null;
  if (!pret) {
    webpush.setVapidDetails(contact, publicKey!, privateKey!);
    pret = true;
  }
  return webpush;
}
