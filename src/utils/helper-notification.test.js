import { describe, test, expect, beforeEach } from "vitest";

import { filterAndSortNotifications } from './helper-notification.js';

const creerNotification = ({
  productionId,
  active,
  updatedAt,
  etatCertification,
  numeroBio,
  organismeCertificateurId,
  dateDemarrage,
  dateArret,
  createdAt
}) => ({
  productionId,
  active,
  updatedAt,
  etatCertification,
  numeroBio,
  organismeCertificateurId,
  dateDemarrage,
  dateArret,
  createdAt
});

describe('filterAndSortNotifications', () => {
  let notifications;

  beforeEach(() => {
    notifications = [
      creerNotification({
        productionId: 1,
        active: true,
        updatedAt: '2024-09-12',
        etatCertification: 'NON ENGAGEE',
        numeroBio: '123',
        organismeCertificateurId: '111',
        createdAt: '2024-09-12'
      }),
      creerNotification({
        productionId: 1,
        active: true,
        updatedAt: '2023-07-01',
        etatCertification: 'ENGAGEE',
        numeroBio: '124',
        organismeCertificateurId: '112',
        dateDemarrage: '2023-06-01',
        createdAt: '2023-06-01'
      }),
      creerNotification({
        productionId: 3,
        active: true,
        updatedAt: '2023-06-01',
        etatCertification: 'SUSPENDUE',
        numeroBio: '123',
        organismeCertificateurId: '111',
        dateArret: '2023-06-01',
        createdAt: '2023-05-01'
      }),
      creerNotification({
        productionId: 4,
        active: true,
        updatedAt: '2022-01-01',
        etatCertification: 'NON ENGAGEE',
        numeroBio: '125',
        organismeCertificateurId: '113',
        createdAt: '2021-12-01'
      }),
    ];
  });

  test('filtre les productions actives', () => {
    const filtered = filterAndSortNotifications(notifications);
    expect(filtered).toHaveLength(3);
  });

  test('exclut les anciennes notifications NON ENGAGEE de plus de 6 mois', () => {
    const filtered = filterAndSortNotifications(notifications);
    expect(filtered).not.toContainEqual(expect.objectContaining({ etatCertification: 'NON ENGAGEE', updatedAt: '2022-01-01' }));
  });

  test('tri par priorité', () => {
    const sorted = filterAndSortNotifications(notifications);
    const order = sorted.map(n => n.etatCertification);
    expect(order).toEqual(['ENGAGEE', 'SUSPENDUE', 'NON ENGAGEE']);
  });

  test('résout les conflits par la date de certification la plus récente', () => {
    const filtered = filterAndSortNotifications(notifications);
    expect(filtered[0].etatCertification).toBe('ENGAGEE');
    expect(filtered[1].etatCertification).toBe('SUSPENDUE');
  });
});
