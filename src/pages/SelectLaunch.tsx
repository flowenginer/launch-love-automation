import { useState } from "react";
import { Plus, Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
    imageUrl: "",
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

    const newLaunch = await createLaunch(formData.name, formData.launchCode, formData.imageUrl);
    if (newLaunch) {
      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso!",
      });
      setFormData({
        name: "",
        launchCode: "",
        imageUrl: "",
        leadCaptureStart: undefined,
        leadCaptureEnd: undefined,
        eventStart: undefined,
        eventEnd: undefined,
        cartOpen: undefined,
        cartClose: undefined,
      });
      setIsOpen(false);
      navigate(`/launch/${newLaunch.id}/dashboard`);
    }
  };

  const handleLaunchSelect = (launchId: string) => {
    navigate(`/launch/${launchId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meus Lançamentos
            </h1>
            <p className="text-gray-600">
              Escolha qual lançamento deseja gerenciar ou crie um novo
            </p>
          </div>
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

                <div>
                  <Label htmlFor="imageUrl">URL da Imagem do Lançamento</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
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

        {/* Grade de Lançamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {launches.map((launch) => (
            <div key={launch.id} className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white rounded-2xl" onClick={() => handleLaunchSelect(launch.id)}>
                <div className="relative h-48">
                  {launch.image_url ? (
                    <img 
                      src={launch.image_url} 
                      alt={launch.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {launch.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <div className="absolute top-3 right-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Menu de opções do card
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{launch.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{launch.launch_code}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs capitalize bg-gray-100 text-gray-700">
                      {launch.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <CalendarIcon className="h-3 w-3" />
                      <span>
                        {launch.event_start ? new Date(launch.event_start).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : '--'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Card para criar novo lançamento */}
          <div className="group">
            <Card 
              className="border-2 border-dashed border-gray-300 hover:border-primary/50 cursor-pointer transition-all duration-300 bg-white rounded-2xl h-64"
              onClick={() => setIsOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Criar Novo Lançamento</h3>
                <p className="text-gray-500 text-sm">Clique para criar um novo lançamento</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}