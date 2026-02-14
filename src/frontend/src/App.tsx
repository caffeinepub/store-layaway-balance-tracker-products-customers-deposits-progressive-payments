import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingBalancesDashboard } from './features/pendingBalances/components/PendingBalancesDashboard';
import { CreatePendingBalanceForm } from './features/pendingBalances/components/CreatePendingBalanceForm';
import { RepairsDashboard } from './features/repairs/components/RepairsDashboard';
import { CreateRepairRecordForm } from './features/repairs/components/CreateRepairRecordForm';
import { OverdueRepairsReminder } from './features/repairs/components/OverdueRepairsReminder';
import { Store, Heart, ShoppingCart, Wrench } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Accesso in corso...' : isAuthenticated ? 'Esci' : 'Accedi';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
    >
      {text}
    </Button>
  );
}

function ProfileSetupDialog({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const [name, setName] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      onComplete();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Benvenuto!</DialogTitle>
          <DialogDescription>
            Per iniziare, inserisci il tuo nome per personalizzare la tua esperienza.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome"
              required
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending || !name.trim()}>
            {saveProfile.isPending ? 'Salvataggio...' : 'Continua'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState<'sales' | 'repairs'>('sales');
  const [showCreateSaleForm, setShowCreateSaleForm] = useState(false);
  const [showCreateRepairForm, setShowCreateRepairForm] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Gestione Negozio</h1>
                <p className="text-sm text-muted-foreground">Informatica & Telefonia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && userProfile && (
                <span className="text-sm text-muted-foreground">
                  Ciao, <span className="font-medium text-foreground">{userProfile.name}</span>
                </span>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Benvenuto</CardTitle>
              <CardDescription>
                Accedi per gestire le vendite con acconti e tracciare le riparazioni dei dispositivi.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <LoginButton />
            </CardContent>
          </Card>
        ) : profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="text-sm text-muted-foreground">Caricamento...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overdue Repairs Reminder */}
            <OverdueRepairsReminder />

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sales' | 'repairs')} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="sales" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Vendite in Sospeso
                  </TabsTrigger>
                  <TabsTrigger value="repairs" className="gap-2">
                    <Wrench className="h-4 w-4" />
                    Riparazioni
                  </TabsTrigger>
                </TabsList>
                <Button
                  onClick={() => {
                    if (activeTab === 'sales') {
                      setShowCreateSaleForm(true);
                    } else {
                      setShowCreateRepairForm(true);
                    }
                  }}
                  size="lg"
                >
                  {activeTab === 'sales' ? 'Nuova Vendita' : 'Nuova Riparazione'}
                </Button>
              </div>

              <TabsContent value="sales" className="space-y-6">
                {showCreateSaleForm && (
                  <CreatePendingBalanceForm
                    onSuccess={() => setShowCreateSaleForm(false)}
                    onCancel={() => setShowCreateSaleForm(false)}
                  />
                )}
                <PendingBalancesDashboard />
              </TabsContent>

              <TabsContent value="repairs" className="space-y-6">
                {showCreateRepairForm && (
                  <CreateRepairRecordForm
                    onSuccess={() => setShowCreateRepairForm(false)}
                    onCancel={() => setShowCreateRepairForm(false)}
                  />
                )}
                <RepairsDashboard />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()} · Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Profile Setup Dialog */}
      <ProfileSetupDialog open={showProfileSetup} onComplete={() => {}} />
    </div>
  );
}
