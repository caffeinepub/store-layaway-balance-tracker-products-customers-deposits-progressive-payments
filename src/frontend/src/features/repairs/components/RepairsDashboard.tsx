import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetOpenRepairRecords, useGetAllRepairRecords } from '../../../hooks/useQueries';
import { RepairDetailDialog } from './RepairDetailDialog';
import { calculateWorkingDaysElapsed } from '../utils/workingDays';
import { filterRepairs, type ContactStatusFilter, type DeliveryStatusFilter } from '../utils/repairFilters';
import { Eye, AlertCircle, CheckCircle2, Phone, PhoneOff, X } from 'lucide-react';
import type { RepairRecord } from '../../../backend';

export function RepairsDashboard() {
  const { data: openRepairs = [], isLoading: openLoading } = useGetOpenRepairRecords();
  const { data: allRepairs = [], isLoading: allLoading } = useGetAllRepairRecords();
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [contactStatusFilter, setContactStatusFilter] = useState<ContactStatusFilter>('all');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<DeliveryStatusFilter>('all');

  const baseRepairs = showAll ? allRepairs : openRepairs;
  const isLoading = showAll ? allLoading : openLoading;

  // Apply filters
  const repairs = filterRepairs(baseRepairs, {
    contactStatus: contactStatusFilter,
    deliveryStatus: deliveryStatusFilter,
  });

  const hasActiveFilters = contactStatusFilter !== 'all' || deliveryStatusFilter !== 'all';

  const resetFilters = () => {
    setContactStatusFilter('all');
    setDeliveryStatusFilter('all');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-sm text-muted-foreground">Caricamento riparazioni...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Elenco Riparazioni</CardTitle>
              <CardDescription>
                {showAll ? 'Tutte le riparazioni' : 'Riparazioni aperte in attesa di consegna'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Mostra Solo Aperte' : 'Mostra Tutte'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-6 rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Filtri</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 gap-1 text-xs">
                  <X className="h-3 w-3" />
                  Ripristina
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {/* Contact Status Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Stato Contatto</label>
                <div className="flex gap-2">
                  <Button
                    variant={contactStatusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContactStatusFilter('all')}
                    className="h-8"
                  >
                    Tutti
                  </Button>
                  <Button
                    variant={contactStatusFilter === 'toCall' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContactStatusFilter('toCall')}
                    className="h-8 gap-1"
                  >
                    <PhoneOff className="h-3 w-3" />
                    Da Chiamare
                  </Button>
                  <Button
                    variant={contactStatusFilter === 'called' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContactStatusFilter('called')}
                    className="h-8 gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    Chiamato
                  </Button>
                </div>
              </div>

              {/* Delivery Status Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-muted-foreground">Stato Consegna</label>
                <div className="flex gap-2">
                  <Button
                    variant={deliveryStatusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeliveryStatusFilter('all')}
                    className="h-8"
                  >
                    Tutti
                  </Button>
                  <Button
                    variant={deliveryStatusFilter === 'notDelivered' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeliveryStatusFilter('notDelivered')}
                    className="h-8"
                  >
                    In Lavorazione
                  </Button>
                  <Button
                    variant={deliveryStatusFilter === 'delivered' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDeliveryStatusFilter('delivered')}
                    className="h-8 gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Consegnato
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {repairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Nessuna riparazione trovata</h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'Nessuna riparazione corrisponde ai filtri selezionati.'
                  : showAll
                    ? 'Non ci sono ancora riparazioni registrate.'
                    : 'Tutte le riparazioni sono state consegnate.'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Stato Contatto</TableHead>
                    <TableHead>Giorni Trascorsi</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairs.map((repair) => {
                    const workingDays = calculateWorkingDaysElapsed(Number(repair.receivedTimestamp) / 1_000_000);
                    const isOverdue = !repair.isDelivered && workingDays > 3;

                    return (
                      <TableRow key={repair.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{repair.deviceCategory}</div>
                            <div className="text-sm text-muted-foreground">{repair.deviceModel}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {repair.customerFirstName} {repair.customerLastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{repair.mobileNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {repair.contactStatus === 'called' ? (
                            <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
                              <Phone className="h-3 w-3" />
                              Chiamato
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 border-orange-600 text-orange-600">
                              <PhoneOff className="h-3 w-3" />
                              Da Chiamare
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={isOverdue ? 'font-semibold text-destructive' : ''}>
                              {workingDays} {workingDays === 1 ? 'giorno' : 'giorni'}
                            </span>
                            {isOverdue && <AlertCircle className="h-4 w-4 text-destructive" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          {repair.isDelivered ? (
                            <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Consegnato
                            </Badge>
                          ) : (
                            <Badge variant="secondary">In Lavorazione</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRepair(repair)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizza
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRepair && (
        <RepairDetailDialog
          repair={selectedRepair}
          open={!!selectedRepair}
          onClose={() => setSelectedRepair(null)}
        />
      )}
    </>
  );
}
