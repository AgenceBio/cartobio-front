/**
 * @param {any} record
 * @returns {String}
 */
export function getTimeAgo(record) {
    if (record.updated_at === record.created_at) return "";

    const now = new Date();
    const date = new Date(record.updated_at);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 1000 / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInMinutes / 1440);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
      return "à l'instant";
    } else if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours} h`;
    } else if (diffInDays < 30) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    } else if (diffInMonths < 12) {
      return `il y a ${diffInMonths} mois`;
    } else {
      const formattedDate = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return `le ${formattedDate}`;
    }
  }