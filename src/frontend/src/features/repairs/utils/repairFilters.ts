import type { RepairRecord } from '../../../backend';

export type ContactStatusFilter = 'all' | 'toCall' | 'called';
export type DeliveryStatusFilter = 'all' | 'delivered' | 'notDelivered';

export interface RepairFilters {
  contactStatus: ContactStatusFilter;
  deliveryStatus: DeliveryStatusFilter;
}

export function filterRepairs(
  repairs: RepairRecord[],
  filters: RepairFilters
): RepairRecord[] {
  return repairs.filter((repair) => {
    // Filter by contact status
    if (filters.contactStatus !== 'all') {
      if (filters.contactStatus === 'toCall' && repair.contactStatus !== 'toCall') {
        return false;
      }
      if (filters.contactStatus === 'called' && repair.contactStatus !== 'called') {
        return false;
      }
    }

    // Filter by delivery status
    if (filters.deliveryStatus !== 'all') {
      if (filters.deliveryStatus === 'delivered' && !repair.isDelivered) {
        return false;
      }
      if (filters.deliveryStatus === 'notDelivered' && repair.isDelivered) {
        return false;
      }
    }

    return true;
  });
}
