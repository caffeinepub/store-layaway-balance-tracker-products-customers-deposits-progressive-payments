import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatePendingBalance } from '../../../hooks/useQueries';
import { parseCurrency, isValidCurrencyInput } from '../utils/money';
import { X } from 'lucide-react';

interface CreatePendingBalanceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePendingBalanceForm({ onSuccess, onCancel }: CreatePendingBalanceFormProps) {
  const createMutation = useCreatePendingBalance();

  const [formData, setFormData] = useState({
    category: '',
    productType: '',
    model: '',
    customerFirstName: '',
    customerLastName: '',
    mobileNumber: '',
    email: '',
    salePrice: '',
    deposit: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category.trim()) newErrors.category = 'Categoria richiesta';
    if (!formData.productType.trim()) newErrors.productType = 'Tipo prodotto richiesto';
    if (!formData.model.trim()) newErrors.model = 'Modello richiesto';
    if (!formData.customerFirstName.trim()) newErrors.customerFirstName = 'Nome richiesto';
    if (!formData.customerLastName.trim()) newErrors.customerLastName = 'Cognome richiesto';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Numero cellulare richiesto';
    if (!formData.email.trim()) newErrors.email = 'Email richiesta';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.salePrice.trim()) {
      newErrors.salePrice = 'Prezzo di vendita richiesto';
    } else if (!isValidCurrencyInput(formData.salePrice)) {
      newErrors.salePrice = 'Importo non valido';
    }

    if (!formData.deposit.trim()) {
      newErrors.deposit = 'Acconto richiesto';
    } else if (!isValidCurrencyInput(formData.deposit)) {
      newErrors.deposit = 'Importo non valido';
    } else {
      const salePrice = parseCurrency(formData.salePrice);
      const deposit = parseCurrency(formData.deposit);
      if (deposit > salePrice) {
        newErrors.deposit = "L'acconto non può superare il prezzo di vendita";
      }
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
        category: formData.category.trim(),
        productType: formData.productType.trim(),
        model: formData.model.trim(),
        customerFirstName: formData.customerFirstName.trim(),
        customerLastName: formData.customerLastName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        salePrice: parseCurrency(formData.salePrice),
        deposit: parseCurrency(formData.deposit),
      });

      // Reset form
      setFormData({
        category: '',
        productType: '',
        model: '',
        customerFirstName: '',
        customerLastName: '',
        mobileNumber: '',
        email: '',
        salePrice: '',
        deposit: '',
      });
      setErrors({});
      onSuccess();
    } catch (error) {
      console.error('Failed to create pending balance:', error);
      setErrors({ submit: 'Errore durante la creazione. Riprova.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nuova Vendita con Acconto</CardTitle>
            <CardDescription>Inserisci i dettagli del prodotto e del cliente</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informazioni Prodotto</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="es. Smartphone"
                />
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="productType">Tipo Prodotto</Label>
                <Input
                  id="productType"
                  value={formData.productType}
                  onChange={(e) => handleChange('productType', e.target.value)}
                  placeholder="es. iPhone"
                />
                {errors.productType && <p className="text-sm text-destructive">{errors.productType}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modello</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="es. 15 Pro Max"
                />
                {errors.model && <p className="text-sm text-destructive">{errors.model}</p>}
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

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Informazioni Pagamento</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Prezzo di Vendita (€)</Label>
                <Input
                  id="salePrice"
                  type="text"
                  value={formData.salePrice}
                  onChange={(e) => handleChange('salePrice', e.target.value)}
                  placeholder="999.00"
                />
                {errors.salePrice && <p className="text-sm text-destructive">{errors.salePrice}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit">Acconto Ricevuto (€)</Label>
                <Input
                  id="deposit"
                  type="text"
                  value={formData.deposit}
                  onChange={(e) => handleChange('deposit', e.target.value)}
                  placeholder="200.00"
                />
                {errors.deposit && <p className="text-sm text-destructive">{errors.deposit}</p>}
              </div>
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
              {createMutation.isPending ? 'Creazione...' : 'Crea Vendita'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
