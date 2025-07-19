import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useNavigate } from "react-router-dom";

export default function SelectLaunch() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    launchCode: "",
    leadCaptureStart: undefined as Date | undefined,
    leadCaptureEnd: undefined as Date | undefined,
    eventStart: undefined as Date | undefined,
    eventEnd: undefined as Date | undefined,
    cartOpen: undefined as Date | undefined,
    cartClose: undefined as Date | undefined,
  });

  const { launches, createLaunch } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.launchCode) {
      toast({
        title: "Erro",
        description: "Nome e código do lançamento são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newLaunch = await createLaunch(formData.name, formData.launchCode);
    if (newLaunch) {
      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso!",
      });
      setIsOpen(false);
      navigate(`/launch/${newLaunch.id}/dashboard`);
    }
  };

  const handleLaunchSelect = (launchId: string) => {
    navigate(`/launch/${launchId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Selecione um Lançamento
          </h1>
          <p className="text-muted-foreground">
            Escolha qual lançamento deseja gerenciar ou crie um novo
          </p>
        </div>

        {/* Botão de Criar Novo Lançamento */}
        <div className="text-center mb-8">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white">
                <Plus className="mr-2 h-5 w-5" />
                Criar Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Lançamento</DialogTitle>
                <DialogDescription>
                  Configure os dados vitais que definem a estrutura do seu lançamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Lançamento *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Método Trader Pro 2025"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="launchCode">Código do Lançamento *</Label>
                    <Input
                      id="launchCode"
                      value={formData.launchCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, launchCode: e.target.value.replace(/\s+/g, '') }))}
                      placeholder="Ex: MTP0725"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Período de Captura de Leads</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.leadCaptureStart && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.leadCaptureStart ? format(formData.leadCaptureStart, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.leadCaptureStart}
                            onSelect={(date) => setFormData(prev => ({ ...prev, leadCaptureStart: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Data de Fim</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.leadCaptureEnd && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.leadCaptureEnd ? format(formData.leadCaptureEnd, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.leadCaptureEnd}
                            onSelect={(date) => setFormData(prev => ({ ...prev, leadCaptureEnd: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Período do Evento/Aulas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.eventStart && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.eventStart ? format(formData.eventStart, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.eventStart}
                            onSelect={(date) => setFormData(prev => ({ ...prev, eventStart: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Data de Fim</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.eventEnd && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.eventEnd ? format(formData.eventEnd, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.eventEnd}
                            onSelect={(date) => setFormData(prev => ({ ...prev, eventEnd: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Carrinho de Vendas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Abertura</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.cartOpen && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.cartOpen ? format(formData.cartOpen, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.cartOpen}
                            onSelect={(date) => setFormData(prev => ({ ...prev, cartOpen: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Fechamento</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.cartClose && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.cartClose ? format(formData.cartClose, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.cartClose}
                            onSelect={(date) => setFormData(prev => ({ ...prev, cartClose: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-gradient-primary hover:opacity-90 text-white">
                    Criar Lançamento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grade de Lançamentos Existentes */}
        {launches.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Lançamentos Existentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {launches.map((launch) => (
                <Card key={launch.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{launch.name}</CardTitle>
                    <CardDescription>
                      Código: {launch.launch_code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{launch.status}</span>
                      </div>
                      <Button 
                        onClick={() => handleLaunchSelect(launch.id)}
                        className="bg-gradient-primary hover:opacity-90 text-white"
                      >
                        Gerenciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}