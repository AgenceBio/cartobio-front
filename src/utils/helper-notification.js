function filterProductions(notifications) {
  return notifications.filter(n => n.productionId != null);
}

function excludeOldNonEngagees(notifications) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return notifications.filter(n => {
    const certificationDate = new Date(n.updatedAt);
    return !(n.etatCertification === "NON ENGAGEE" && certificationDate < sixMonthsAgo);
  });
}

const priorityOrder = ["RETIREE", "ENGAGEE", "SUSPENDUE", "ENGAGEE FUTUR", "NON ENGAGEE-CHT OC", "ARRETEE", "NON ENGAGEE"];

function sortByPriority(notifications) {
  return notifications.sort((a, b) => {
    const priorityA = priorityOrder.indexOf(a.etatCertification);
    const priorityB = priorityOrder.indexOf(b.etatCertification);
    return priorityA - priorityB;
  });
}

function resolveConflicts(notifications) {
  const groupedNotifications = {};

  notifications.forEach(n => {
    const key = `${n.numeroBio}-${n.organismeCertificateurId}`;
    if (!groupedNotifications[key]) {
      groupedNotifications[key] = [];
    }
    groupedNotifications[key].push(n);
  });

  Object.keys(groupedNotifications).forEach(key => {
    const group = groupedNotifications[key];

    group.sort((a, b) => {
      if (a.etatCertification === b.etatCertification) {
        if (a.etatCertification === "ENGAGEE" || a.etatCertification === "ARRÊTÉE") {
          return new Date(b.dateDemarrage || b.dateArret) - new Date(a.dateDemarrage || a.dateArret);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  });

  return Object.values(groupedNotifications).flat();
}

export function filterAndSortNotifications(notifications,options) {
  let filtered = !options ? filterProductions(notifications) : notifications;
  filtered = excludeOldNonEngagees(filtered);
  filtered = sortByPriority(filtered);
  return resolveConflicts(filtered);
}
