import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { useAddPayment } from '../../../hooks/useQueries';
import { formatCurrency, parseCurrency, isValidCurrencyInput, calculateTotalPaid, calculateRemaining } from '../utils/money';
import { formatDateTime } from '../../../utils/dateTime';
import type { PendingBalance } from '../../../backend';

interface PendingBalanceDetailDialogProps {
  balance: PendingBalance;
  open: boolean;
  onClose: () => void;
}

export function PendingBalanceDetailDialog({ balance, open, onClose }: PendingBalanceDetailDialogProps) {
  const addPaymentMutation = useAddPayment();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState('');

  const totalPaid = calculateTotalPaid(balance.payments);
  const remaining = calculateRemaining(balance.salePrice, totalPaid);
  const isPaid = balance.isPaid || remaining === BigInt(0);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paymentAmount.trim()) {
      setError('Inserisci un importo');
      return;
    }

    if (!isValidCurrencyInput(paymentAmount)) {
      setError('Importo non valido');
      return;
    }

    const amount = parseCurrency(paymentAmount);
    if (amount > remaining) {
      setError('L\'importo supera il saldo residuo');
      return;
    }

    try {
      await addPaymentMutation.mutateAsync({
        id: balance.id,
        amount,
      });
      setPaymentAmount('');
    } catch (error) {
      console.error('Failed to add payment:', error);
      setError('Errore durante l\'aggiunta del pagamento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Vendita</DialogTitle>
          <DialogDescription>
            {balance.productType} {balance.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Informazioni Prodotto</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Categoria</Label>
                <p className="font-medium">{balance.category}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tipo</Label>
                <p className="font-medium">{balance.productType}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-muted-foreground">Modello</Label>
                <p className="font-medium">{balance.model}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Informazioni Cliente</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">
                  {balance.customerFirstName} {balance.customerLastName}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Numero Cellulare</Label>
                <p className="font-medium">{balance.mobileNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{balance.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Riepilogo Pagamento</h3>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prezzo di Vendita:</span>
                <span className="font-medium">{formatCurrency(balance.salePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Totale Pagato:</span>
                <span className={`font-medium ${isPaid ? 'text-green-600' : ''}`}>
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Saldo Residuo:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${isPaid ? 'text-green-600' : 'text-destructive'}`}>
                    {formatCurrency(remaining)}
                  </span>
                  {isPaid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add Payment Form */}
          {!isPaid && (
            <>
              <Separator />
              <form onSubmit={handleAddPayment} className="space-y-3">
                <h3 className="text-sm font-semibold">Aggiungi Pagamento</h3>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Importo (€)"
                    />
                    {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
                  </div>
                  <Button type="submit" disabled={addPaymentMutation.isPending}>
                    <Plus className="mr-2 h-4 w-4" />
                    {addPaymentMutation.isPending ? 'Aggiunta...' : 'Aggiungi'}
                  </Button>
                </div>
              </form>
            </>
          )}

          <Separator />

          {/* Payment History */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Cronologia Pagamenti</h3>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balance.payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDateTime(payment.date)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
