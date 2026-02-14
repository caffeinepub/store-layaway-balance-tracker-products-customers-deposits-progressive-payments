import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  useUpdateRepairQuote, 
  useUpdateContactStatus, 
  useMarkRepairDelivered, 
  useUnmarkRepairDelivered 
} from '../../../hooks/useQueries';
import { formatCurrency, parseCurrency, isValidCurrencyInput } from '../../pendingBalances/utils/money';
import { calculateWorkingDaysElapsed, calculateWorkingDaysOverdue } from '../utils/workingDays';
import { formatDateTime } from '../../../utils/dateTime';
import { AlertCircle, Phone, PhoneOff, Calendar, Clock } from 'lucide-react';
import type { RepairRecord } from '../../../backend';
import { ContactStatus } from '../../../backend';

interface RepairDetailDialogProps {
  repair: RepairRecord;
  open: boolean;
  onClose: () => void;
}

export function RepairDetailDialog({ repair, open, onClose }: RepairDetailDialogProps) {
  const updateQuoteMutation = useUpdateRepairQuote();
  const updateContactMutation = useUpdateContactStatus();
  const markDeliveredMutation = useMarkRepairDelivered();
  const unmarkDeliveredMutation = useUnmarkRepairDelivered();

  const [quoteInput, setQuoteInput] = useState(
    repair.quoteAmount ? (Number(repair.quoteAmount) / 100).toFixed(2) : ''
  );
  const [quoteError, setQuoteError] = useState('');

  const workingDays = calculateWorkingDaysElapsed(Number(repair.receivedTimestamp) / 1_000_000);
  const isOverdue = !repair.isDelivered && workingDays > 3;
  const daysOverdue = isOverdue ? calculateWorkingDaysOverdue(Number(repair.receivedTimestamp) / 1_000_000) : 0;

  const handleUpdateQuote = async () => {
    setQuoteError('');

    if (!quoteInput.trim()) {
      setQuoteError('Inserisci un importo');
      return;
    }

    if (!isValidCurrencyInput(quoteInput)) {
      setQuoteError('Importo non valido');
      return;
    }

    try {
      await updateQuoteMutation.mutateAsync({
        id: repair.id,
        newQuote: parseCurrency(quoteInput),
      });
    } catch (error) {
      console.error('Failed to update quote:', error);
      setQuoteError('Errore durante l\'aggiornamento');
    }
  };

  const handleToggleContactStatus = async () => {
    const newStatus = repair.contactStatus === 'called' ? ContactStatus.toCall : ContactStatus.called;
    try {
      await updateContactMutation.mutateAsync({
        id: repair.id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Failed to update contact status:', error);
    }
  };

  const handleToggleDelivered = async (checked: boolean) => {
    try {
      if (checked) {
        await markDeliveredMutation.mutateAsync(repair.id);
      } else {
        await unmarkDeliveredMutation.mutateAsync(repair.id);
      }
    } catch (error) {
      console.error('Failed to toggle delivered status:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Riparazione</DialogTitle>
          <DialogDescription>
            {repair.deviceCategory} - {repair.deviceModel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overdue Warning */}
          {isOverdue && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Questa riparazione è in ritardo di <strong>{daysOverdue}</strong> {daysOverdue === 1 ? 'giorno lavorativo' : 'giorni lavorativi'}.
              </AlertDescription>
            </Alert>
          )}

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Informazioni Cliente</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">
                  {repair.customerFirstName} {repair.customerLastName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Numero Cellulare</Label>
                <p className="font-medium">{repair.mobileNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{repair.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Problem Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Descrizione Problema</Label>
            <p className="text-sm leading-relaxed">{repair.problemDescription}</p>
          </div>

          <Separator />

          {/* Quote */}
          <div className="space-y-3">
            <Label htmlFor="quote">Preventivo (€)</Label>
            <div className="flex gap-2">
              <Input
                id="quote"
                type="text"
                value={quoteInput}
                onChange={(e) => {
                  setQuoteInput(e.target.value);
                  if (quoteError) setQuoteError('');
                }}
                placeholder="50.00"
              />
              <Button
                onClick={handleUpdateQuote}
                disabled={updateQuoteMutation.isPending}
              >
                {updateQuoteMutation.isPending ? 'Aggiornamento...' : 'Aggiorna'}
              </Button>
            </div>
            {quoteError && <p className="text-sm text-destructive">{quoteError}</p>}
            {repair.quoteAmount && !quoteError && (
              <p className="text-sm text-muted-foreground">
                Preventivo attuale: <span className="font-medium">{formatCurrency(repair.quoteAmount)}</span>
              </p>
            )}
          </div>

          <Separator />

          {/* Contact Status */}
          <div className="space-y-3">
            <Label>Stato Contatto</Label>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleToggleContactStatus}
              disabled={updateContactMutation.isPending}
            >
              {repair.contactStatus === 'called' ? (
                <>
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>Chiamato</span>
                </>
              ) : (
                <>
                  <PhoneOff className="h-4 w-4 text-orange-600" />
                  <span>Da Chiamare</span>
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Delivery Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivered"
              checked={repair.isDelivered}
              onCheckedChange={handleToggleDelivered}
              disabled={markDeliveredMutation.isPending || unmarkDeliveredMutation.isPending}
            />
            <Label
              htmlFor="delivered"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Consegnato al cliente
            </Label>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Cronologia</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ricevuto:</span>
                <span className="font-medium">{formatDateTime(repair.receivedTimestamp)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Giorni lavorativi trascorsi:</span>
                <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {workingDays} {workingDays === 1 ? 'giorno' : 'giorni'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
