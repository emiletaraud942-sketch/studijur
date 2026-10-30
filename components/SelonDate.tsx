"use client";

import { useEffect, useState, type ReactNode } from "react";
import { apresBascule } from "@/lib/tarifs";

// Le texte d'offre change à la date de bascule (lib/tarifs.ts) sans
// redéploiement : calculé dans le navigateur après le montage, pour que les
// pages servies statiquement (/presentation) ne figent pas la valeur du jour
// du build, et sans écart d'hydratation.
export default function SelonDate({ avant, apres }: { avant: ReactNode; apres: ReactNode }) {
  const [post, setPost] = useState(false);
  useEffect(() => { setPost(apresBascule()); }, []);
  return <>{post ? apres : avant}</>;
}
