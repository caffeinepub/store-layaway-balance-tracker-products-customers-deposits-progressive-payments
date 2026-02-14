import { useState } from 'react';
import { useGetAllPendingBalances } from '../../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { formatCurrency, calculateTotalPaid, calculateRemaining } from '../utils/money';
import { PendingBalanceDetailDialog } from './PendingBalanceDetailDialog';
import type { PendingBalance } from '../../../backend';

export function PendingBalancesDashboard() {
  const { data: balances, isLoading, error } = useGetAllPendingBalances();
  const [selectedBalance, setSelectedBalance] = useState<PendingBalance | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-sm text-muted-foreground">Caricamento vendite...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <p className="text-sm text-muted-foreground">Errore nel caricamento delle vendite</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nessuna vendita in sospeso</p>
            <p className="mt-1 text-xs text-muted-foreground">Crea una nuova vendita per iniziare</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Elenco Vendite</CardTitle>
          <CardDescription>
            {balances.length} {balances.length === 1 ? 'vendita' : 'vendite'} in sospeso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stato</TableHead>
                  <TableHead>Prodotto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Prezzo</TableHead>
                  <TableHead className="text-right">Pagato</TableHead>
                  <TableHead className="text-right">Residuo</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => {
                  const totalPaid = calculateTotalPaid(balance.payments);
                  const remaining = calculateRemaining(balance.salePrice, totalPaid);
                  const isPaid = balance.isPaid || remaining === BigInt(0);

                  return (
                    <TableRow
                      key={balance.id}
                      className={!isPaid ? 'bg-destructive/5' : ''}
                    >
                      <TableCell>
                        {isPaid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            In sospeso
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {balance.productType} {balance.model}
                          </div>
                          <div className="text-sm text-muted-foreground">{balance.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {balance.customerFirstName} {balance.customerLastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{balance.mobileNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(balance.salePrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={isPaid ? 'text-green-600 font-medium' : ''}>
                          {formatCurrency(totalPaid)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={!isPaid ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {formatCurrency(remaining)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBalance(balance)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Dettagli
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedBalance && (
        <PendingBalanceDetailDialog
          balance={selectedBalance}
          open={!!selectedBalance}
          onClose={() => setSelectedBalance(null)}
        />
      )}
    </>
  );
}
