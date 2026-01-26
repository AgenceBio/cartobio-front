export const culturesPerennes = [
  "01.21.11", // Vigne
  "01.21.12", // Vigne

  "01.22.11", // Fruits
  "01.22.12",
  "01.22.13",
  "01.22.14",
  "01.22.19",
  "01.22.19.1",
  "01.22.19.2",
  "01.22.19.3",
  "01.22.19.4",
  "01.22.19.5",
  "01.22.19.6",
  "01.22.19.7",
  "01.22.19.8",
  "01.22.19.9",
  "01.23",
  "01.23.1",
  "01.23.11",
  "01.23.12",
  "01.23.13",
  "01.23.14",
  "01.23.19",
  "01.24",
  "01.24.1",
  "01.24.10",
  "01.24.10.1",
  "01.24.10.2",
  "01.24.2",
  "01.24.21",
  "01.24.22",
  "01.24.23",
  "01.24.24",
  "01.24.25",
  "01.24.26",
  "01.24.27",
  "01.24.27.1",
  "01.24.28",
  "01.24.29",
  "01.24.29.1",
  "01.24.29.2",
  "01.25",
  "01.25.1",
  "01.25.11",
  "01.25.12",
  "01.25.13",
  "01.25.19",
  "01.25.19.1",
  "01.25.19.2",
  "01.25.19.4",
  "01.25.19.5",
  "01.25.19.9",
  "01.25.2",
  "01.25.20",
  "01.25.3",
  "01.25.31",
  "01.25.32",
  "01.25.33",
  "01.25.34",
  "01.25.35",
  "01.25.39",
  "01.25.9",
  "01.25.90",
  "01.26",
  "01.26.1",
  "01.26.11",
  "01.26.12",
  "01.26.2",
  "01.26.20",
  "01.26.9",

  "01.19.10.12", // Prairie permanente
];

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
      currentCultures.cultures.some((a) => c.CPF === a.CPF && !culturesPerennes.includes(a.CPF)),
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
      currentCultures.cultures.some((a) => c.CPF === a.CPF && !culturesPerennes.includes(a.CPF)),
    );

    if (match) {
      count++;
    } else {
      break;
    }
  }

  return count;
}
