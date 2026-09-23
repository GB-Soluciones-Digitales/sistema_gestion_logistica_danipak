import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight, Sheet, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { movimientosService } from '../../../api/movimientosService';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import { exportarAExcel } from '../../../utils/excelGenerator';

export default function CuentasCorrientes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filtroSaldo, setFiltroSaldo] = useState('Todos');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['cuentas-corrientes'],
    queryFn: () => movimientosService.getResumenGeneral(),
  });

  const cuentas = Array.isArray(data) ? data : (data?.items || []);
  const totalRegistros = data?.totalRegistros || cuentas.length;

  // Filtrado local rápido
  const cuentasFiltradas = cuentas.filter(c => {
    const matchSearch = c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase());
    let matchSaldo = true;
    
    if (filtroSaldo === 'Deudores') matchSaldo = c.saldo_total > 0;
    if (filtroSaldo === 'A favor') matchSaldo = c.saldo_total < 0;
    if (filtroSaldo === 'Cero') matchSaldo = c.saldo_total === 0;
    
    return matchSearch && matchSaldo;
  });

  const hayFiltros = searchTerm !== "" || filtroSaldo !== 'Todos';
  
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltroSaldo("Todos");
  };

  const handleExportarExcel = () => {
    setIsExporting(true);
    toast.info("Generando archivo Excel...");
    try {
      if (cuentasFiltradas.length === 0) {
        toast.warning("No hay datos para exportar con este filtro.");
        return;
      }

      const datosFormateados = cuentasFiltradas.map(c => ({
        'Cliente': c.razon_social,
        'CUIT / DNI': c.cuit_dni,
        'Teléfono': c.telefono || '-',
        'Saldo Total ($)': c.saldo_total,
        'Estado': c.saldo_total > 0 ? 'Deudor' : (c.saldo_total < 0 ? 'Saldo a Favor' : 'Al Día')
      }));

      exportarAExcel(datosFormateados, 'Estado_Cuentas_Corrientes', 'Saldos');
    } finally {
      setIsExporting(false);
    }
  };

  const columnas = [
    { key: 'razon_social', label: 'Cliente' },
    { key: 'cuit_dni', label: 'CUIT/DNI' },
    { key: 'telefono', label: 'Teléfono', render: (fila) => fila.telefono || '-' },
    { key: 'saldo_total', label: 'Estado de Cuenta',
      render: (fila) => (
        <span className={`font-bold ${fila.saldo_total > 0 ? 'text-red-600' : fila.saldo_total < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {fila.saldo_total > 0 ? 'Debe: ' : fila.saldo_total < 0 ? 'A favor: ' : 'Al día: '}
          $ {Math.abs(fila.saldo_total).toLocaleString('es-AR')}
        </span>
      )
    },
    { key: 'acciones', label: 'Acciones',
      render: (fila) => (
        <div className="flex gap-1">
          <Button variant="outline" className="px-2 py-1 h-8" onClick={() => navigate(`/cuentas-corrientes/${fila.cliente_id}`)}>
            <Eye size={16} className="text-blue-600" />
          </Button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(totalRegistros / limit);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Cuentas Corrientes</h1>
        <p className="text-muted-foreground text-sm mt-1">Saldos globales de clientes autorizados</p>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              placeholder="Buscar por razón social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={handleExportarExcel}
              disabled={isExporting || isLoading}
              className="w-full sm:w-auto text-green-700 border-green-200 hover:bg-green-50"
            >
              <Sheet size={18} className="mr-2" />
              {isExporting ? 'Exportando...' : 'Excel'}
            </Button>

            <select 
              value={filtroSaldo} 
              onChange={(e) => setFiltroSaldo(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary w-full sm:w-auto"
            >
              <option value="Todos">Todos los saldos</option>
              <option value="Deudores">Solo Deudores (Deben)</option>
              <option value="A favor">Saldos A Favor</option>
              <option value="Cero">Saldos en Cero</option>
            </select>

            {hayFiltros && (
              <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50">
                <X size={18} className="mr-2" /> Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Calculando saldos...</div>
        ) : (
          <DataTable columns={columnas} data={cuentasFiltradas} />
        )}

        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {cuentasFiltradas.length} de {totalRegistros} Cuentas Corrientes
            </span>
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1 || isLoading} className="px-2 py-1 h-8">
                <ChevronLeft size={18} />
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
              <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages } className="px-2 py-1 h-8">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}