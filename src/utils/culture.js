import { fromCodeCpf } from "@agencebio/rosetta-cultures";

/**
 * Indique si une culture est exclue du contrôle de rotation (cultures pérennes, prairies, etc.)
 * @param {string} codeCpf
 * @returns {boolean}
 */
export function isCultureNonRotative(codeCpf) {
  return Boolean(fromCodeCpf(codeCpf)?.non_rotative);
}

/**
 * @param {Array|null} historique
 * @returns {number}
 */
export function countRotationErrors(index, historique) {
  if (!historique) return 0;
  const currentCultures = historique[index];
  if (!currentCultures || currentCultures.cultures.length !== 1) return 0;
  let count = 1;

  for (let i = index - 1; i >= 0; i--) {
    const voisin = historique[i];
    if (!voisin) break;

    const match = voisin.cultures.some((c) =>
      currentCultures.cultures.some((a) => c.CPF === a.CPF && !isCultureNonRotative(a.CPF)),
    );
    if (match) {
      count++;
    } else {
      break;
    }
  }
  for (let i = index + 1; i < historique.length; i++) {
    const voisin = historique[i];
    if (!voisin) break;

    const match = voisin.cultures.some((c) =>
      currentCultures.cultures.some((a) => c.CPF === a.CPF && !isCultureNonRotative(a.CPF)),
    );

    if (match) {
      count++;
    } else {
      break;
    }
  }

  return count;
}
