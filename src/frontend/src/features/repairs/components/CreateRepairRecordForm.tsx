import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateRepairRecord } from '../../../hooks/useQueries';
import { parseCurrency, isValidCurrencyInput } from '../../pendingBalances/utils/money';
import { validateRepairForm } from '../utils/repairsFormValidation';
import { X } from 'lucide-react';

interface CreateRepairRecordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateRepairRecordForm({ onSuccess, onCancel }: CreateRepairRecordFormProps) {
  const createMutation = useCreateRepairRecord();

  const [formData, setFormData] = useState({
    deviceCategory: '',
    deviceModel: '',
    customerFirstName: '',
    customerLastName: '',
    mobileNumber: '',
    email: '',
    problemDescription: '',
    quoteAmount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors = validateRepairForm(formData);

    if (formData.quoteAmount.trim() && !isValidCurrencyInput(formData.quoteAmount)) {
      newErrors.quoteAmount = 'Importo non valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await createMutation.mutateAsync({
        id,
        deviceCategory: formData.deviceCategory.trim(),
        deviceModel: formData.deviceModel.trim(),
        customerFirstName: formData.customerFirstName.trim(),
        customerLastName: formData.customerLastName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        problemDescription: formData.problemDescription.trim(),
        quoteAmount: formData.quoteAmount.trim() ? parseCurrency(formData.quoteAmount) : null,
      });

      setFormData({
        deviceCategory: '',
        deviceModel: '',
        customerFirstName: '',
        customerLastName: '',
        mobileNumber: '',
        email: '',
        problemDescription: '',
        quoteAmount: '',
      });
      setErrors({});
      onSuccess();
    } catch (error) {
      console.error('Failed to create repair record:', error);
      setErrors({ submit: 'Errore durante la creazione. Riprova.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nuova Riparazione</CardTitle>
            <CardDescription>Inserisci i dettagli del dispositivo e del cliente</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Device Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informazioni Dispositivo</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deviceCategory">Categoria Dispositivo</Label>
                <Input
                  id="deviceCategory"
                  value={formData.deviceCategory}
                  onChange={(e) => handleChange('deviceCategory', e.target.value)}
                  placeholder="es. Smartphone, Laptop, Tablet"
                />
                {errors.deviceCategory && <p className="text-sm text-destructive">{errors.deviceCategory}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceModel">Modello Dispositivo</Label>
                <Input
                  id="deviceModel"
                  value={formData.deviceModel}
                  onChange={(e) => handleChange('deviceModel', e.target.value)}
                  placeholder="es. iPhone 15 Pro, MacBook Air M2"
                />
                {errors.deviceModel && <p className="text-sm text-destructive">{errors.deviceModel}</p>}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informazioni Cliente</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerFirstName">Nome</Label>
                <Input
                  id="customerFirstName"
                  value={formData.customerFirstName}
                  onChange={(e) => handleChange('customerFirstName', e.target.value)}
                  placeholder="Nome"
                />
                {errors.customerFirstName && <p className="text-sm text-destructive">{errors.customerFirstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerLastName">Cognome</Label>
                <Input
                  id="customerLastName"
                  value={formData.customerLastName}
                  onChange={(e) => handleChange('customerLastName', e.target.value)}
                  placeholder="Cognome"
                />
                {errors.customerLastName && <p className="text-sm text-destructive">{errors.customerLastName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Numero Cellulare</Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                  placeholder="+39 123 456 7890"
                />
                {errors.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@esempio.it"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Dettagli Riparazione</h3>
            <div className="space-y-2">
              <Label htmlFor="problemDescription">Descrizione Problema</Label>
              <Textarea
                id="problemDescription"
                value={formData.problemDescription}
                onChange={(e) => handleChange('problemDescription', e.target.value)}
                placeholder="Descrivi il problema riscontrato dal cliente..."
                rows={4}
              />
              {errors.problemDescription && <p className="text-sm text-destructive">{errors.problemDescription}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteAmount">Preventivo (€) - Opzionale</Label>
              <Input
                id="quoteAmount"
                type="text"
                value={formData.quoteAmount}
                onChange={(e) => handleChange('quoteAmount', e.target.value)}
                placeholder="50.00"
              />
              {errors.quoteAmount && <p className="text-sm text-destructive">{errors.quoteAmount}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creazione...' : 'Crea Riparazione'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
