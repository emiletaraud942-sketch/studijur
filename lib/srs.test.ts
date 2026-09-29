import { describe, expect, it } from "vitest";
import { BOX_INTERVALS, dueNotions, gradeNotion, newNotionMastery, scoreMaitriseFromBox } from "./srs";
import type { NotionMastery } from "./types";

describe("scoreMaitriseFromBox", () => {
  it("mappe la boîte 1 (jamais réussie) à un score bas", () => {
    expect(scoreMaitriseFromBox(1)).toBe(20);
  });

  it("mappe la dernière boîte à 100", () => {
    expect(scoreMaitriseFromBox(BOX_INTERVALS.length)).toBe(100);
  });

  it("est croissant avec le numéro de boîte", () => {
    const scores = BOX_INTERVALS.map((_, i) => scoreMaitriseFromBox(i + 1));
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeGreaterThan(scores[i - 1]);
  });

  it("plafonne pour une boîte hors échelle plutôt que de planter", () => {
    expect(scoreMaitriseFromBox(99)).toBe(100);
    expect(scoreMaitriseFromBox(0)).toBe(scoreMaitriseFromBox(1));
  });
});

describe("newNotionMastery", () => {
  it("démarre en boîte 1 avec une échéance à 1 jour", () => {
    const m = newNotionMastery("orga-03");
    expect(m.notionId).toBe("orga-03");
    expect(m.box).toBe(1);
    expect(m.scoreMaitrise).toBe(scoreMaitriseFromBox(1));
    expect(m.reussitesConsecutives).toBe(0);
    expect(m.lapses).toBe(0);
    expect(m.reviews).toBe(1);
    const daysUntilDue = (new Date(m.dueAt).getTime() - Date.now()) / 86400000;
    expect(daysUntilDue).toBeGreaterThan(0.9);
    expect(daysUntilDue).toBeLessThan(1.1);
  });
});

describe("gradeNotion", () => {
  it("fait avancer la boîte d'un cran sur une bonne réponse", () => {
    const m = newNotionMastery("orga-03");
    const next = gradeNotion(m, true);
    expect(next.box).toBe(2);
    expect(next.scoreMaitrise).toBe(scoreMaitriseFromBox(2));
    expect(next.reussitesConsecutives).toBe(1);
    expect(next.lapses).toBe(0);
    expect(next.reviews).toBe(2);
  });

  it("ne dépasse jamais la dernière boîte, même après beaucoup de succès", () => {
    let m = newNotionMastery("orga-03");
    for (let i = 0; i < 20; i++) m = gradeNotion(m, true);
    expect(m.box).toBe(BOX_INTERVALS.length);
    expect(m.scoreMaitrise).toBe(100);
  });

  it("réinitialise la boîte à 1 et remet reussitesConsecutives à 0 sur une mauvaise réponse", () => {
    let m = newNotionMastery("orga-03");
    m = gradeNotion(m, true);
    m = gradeNotion(m, true);
    expect(m.box).toBeGreaterThan(1);
    const apresEchec = gradeNotion(m, false);
    expect(apresEchec.box).toBe(1);
    expect(apresEchec.reussitesConsecutives).toBe(0);
    expect(apresEchec.lapses).toBe(m.lapses + 1);
    expect(apresEchec.scoreMaitrise).toBe(scoreMaitriseFromBox(1));
  });

  it("incrémente reviews à chaque passage, succès ou échec", () => {
    let m = newNotionMastery("orga-03");
    m = gradeNotion(m, false);
    m = gradeNotion(m, true);
    expect(m.reviews).toBe(3); // 1 (création) + 2 grades
  });

  it("programme la prochaine échéance selon BOX_INTERVALS[box - 1]", () => {
    const m = newNotionMastery("orga-03");
    const next = gradeNotion(m, true); // box 2 -> intervalle BOX_INTERVALS[1]
    const daysUntilDue = (new Date(next.dueAt).getTime() - Date.now()) / 86400000;
    expect(daysUntilDue).toBeGreaterThan(BOX_INTERVALS[1] - 0.1);
    expect(daysUntilDue).toBeLessThan(BOX_INTERVALS[1] + 0.1);
  });
});

describe("dueNotions", () => {
  function withDueAt(notionId: string, dueAt: string, scoreMaitrise = 50): NotionMastery {
    return { notionId, box: 1, scoreMaitrise, reussitesConsecutives: 0, lapses: 0, reviews: 1, dueAt };
  }

  it("ne renvoie que les notions dont l'échéance est passée", () => {
    const hier = new Date(Date.now() - 86400000).toISOString();
    const demain = new Date(Date.now() + 86400000).toISOString();
    const notions = {
      a: withDueAt("a", hier),
      b: withDueAt("b", demain),
    };
    const dues = dueNotions(notions);
    expect(dues.map((n) => n.notionId)).toEqual(["a"]);
  });

  it("trie par score de maîtrise croissant : priorité aux plus faibles", () => {
    const hier = new Date(Date.now() - 86400000).toISOString();
    const notions = {
      forte: withDueAt("forte", hier, 80),
      faible: withDueAt("faible", hier, 20),
      moyenne: withDueAt("moyenne", hier, 50),
    };
    const dues = dueNotions(notions);
    expect(dues.map((n) => n.notionId)).toEqual(["faible", "moyenne", "forte"]);
  });

  it("renvoie un tableau vide si aucune notion n'est encore due", () => {
    const demain = new Date(Date.now() + 86400000).toISOString();
    expect(dueNotions({ a: withDueAt("a", demain) })).toEqual([]);
  });
});
