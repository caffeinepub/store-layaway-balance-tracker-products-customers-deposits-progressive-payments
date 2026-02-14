import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useGetOpenRepairRecords } from '../../../hooks/useQueries';
import { calculateWorkingDaysElapsed } from '../utils/workingDays';
import { hasShownReminderToday, markReminderShown } from '../utils/overdueReminderState';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OverdueRepairsReminder() {
  const { identity } = useInternetIdentity();
  const { data: openRepairs = [] } = useGetOpenRepairRecords();
  const [dismissed, setDismissed] = useState(false);

  const userKey = identity?.getPrincipal().toString() || 'anonymous';

  // Check if we've already shown the reminder today for this user
  const alreadyShown = hasShownReminderToday(userKey);

  // Filter overdue repairs (more than 3 working days)
  const overdueRepairs = openRepairs.filter((repair) => {
    const workingDays = calculateWorkingDaysElapsed(Number(repair.receivedTimestamp) / 1_000_000);
    return workingDays > 3;
  });

  const shouldShow = overdueRepairs.length > 0 && !alreadyShown && !dismissed;

  useEffect(() => {
    if (shouldShow) {
      markReminderShown(userKey);
    }
  }, [shouldShow, userKey]);

  if (!shouldShow) {
    return null;
  }

  const displayCount = 3;
  const displayedRepairs = overdueRepairs.slice(0, displayCount);
  const remainingCount = overdueRepairs.length - displayCount;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Promemoria Riparazioni in Ritardo</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mr-2"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Hai <strong>{overdueRepairs.length}</strong>{' '}
          {overdueRepairs.length === 1 ? 'riparazione in ritardo' : 'riparazioni in ritardo'} (oltre 3 giorni lavorativi):
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {displayedRepairs.map((repair) => {
            const workingDays = calculateWorkingDaysElapsed(Number(repair.receivedTimestamp) / 1_000_000);
            return (
              <li key={repair.id}>
                {repair.deviceCategory} - {repair.customerFirstName} {repair.customerLastName} ({workingDays}{' '}
                {workingDays === 1 ? 'giorno' : 'giorni'})
              </li>
            );
          })}
        </ul>
        {remainingCount > 0 && (
          <p className="mt-2 text-sm">
            ...e altre <strong>{remainingCount}</strong> {remainingCount === 1 ? 'riparazione' : 'riparazioni'}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
