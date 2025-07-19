import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Rocket } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from '@/hooks/use-toast';

const LaunchSelector = () => {
  const { launches, selectedLaunch, setSelectedLaunch, createLaunch } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLaunchName, setNewLaunchName] = useState('');
  const [newLaunchCode, setNewLaunchCode] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateLaunch = async () => {
    if (!newLaunchName.trim() || !newLaunchCode.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e código do lançamento",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    
    const launch = await createLaunch(newLaunchName.trim(), newLaunchCode.trim());
    
    if (launch) {
      toast({
        title: "Lançamento criado!",
        description: `${launch.name} foi criado com sucesso`
      });
      setShowCreateDialog(false);
      setNewLaunchName('');
      setNewLaunchCode('');
    } else {
      toast({
        title: "Erro ao criar lançamento",
        description: "Verifique se o código não está em uso",
        variant: "destructive"
      });
    }
    
    setCreating(false);
  };

  const generateLaunchCode = () => {
    const code = newLaunchName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 10);
    setNewLaunchCode(code);
  };

  if (launches.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Rocket className="h-4 w-4" />
          <span className="text-sm">Nenhum lançamento</span>
        </div>
        <Button 
          size="sm" 
          onClick={() => setShowCreateDialog(true)}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Criar primeiro lançamento
        </Button>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo lançamento</DialogTitle>
              <DialogDescription>
                Configure um novo projeto de lançamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="launch-name">Nome do lançamento</Label>
                <Input
                  id="launch-name"
                  placeholder="Ex: Curso de Marketing Digital"
                  value={newLaunchName}
                  onChange={(e) => setNewLaunchName(e.target.value)}
                  onBlur={generateLaunchCode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="launch-code">Código do lançamento</Label>
                <Input
                  id="launch-code"
                  placeholder="Ex: marketing2024"
                  value={newLaunchCode}
                  onChange={(e) => setNewLaunchCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Será usado nas URLs dos webhooks
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateLaunch} disabled={creating}>
                {creating ? "Criando..." : "Criar lançamento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select 
        value={selectedLaunch?.id || ''} 
        onValueChange={(value) => {
          const launch = launches.find(l => l.id === value);
          setSelectedLaunch(launch || null);
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecione um lançamento" />
        </SelectTrigger>
        <SelectContent>
          {launches.map((launch) => (
            <SelectItem key={launch.id} value={launch.id}>
              <div className="flex items-center space-x-2">
                <Rocket className="h-4 w-4" />
                <span>{launch.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => setShowCreateDialog(true)}
        className="h-10"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo lançamento</DialogTitle>
            <DialogDescription>
              Configure um novo projeto de lançamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="launch-name">Nome do lançamento</Label>
              <Input
                id="launch-name"
                placeholder="Ex: Curso de Marketing Digital"
                value={newLaunchName}
                onChange={(e) => setNewLaunchName(e.target.value)}
                onBlur={generateLaunchCode}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="launch-code">Código do lançamento</Label>
              <Input
                id="launch-code"
                placeholder="Ex: marketing2024"
                value={newLaunchCode}
                onChange={(e) => setNewLaunchCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Será usado nas URLs dos webhooks
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateLaunch} disabled={creating}>
              {creating ? "Criando..." : "Criar lançamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LaunchSelector;