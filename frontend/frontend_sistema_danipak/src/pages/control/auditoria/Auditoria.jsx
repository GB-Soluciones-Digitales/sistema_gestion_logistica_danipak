import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Eye, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { auditoriaService } from '../../../api/auditoriaServices';
import { usuarioService } from '../../../api/usuariosService';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import AuditoriaDetalleModal from './AuditoriaDetalle';
import { formatFecha } from './AuditoriaDetalleUtils';

export default function Auditoria() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showFilters, setShowFilters] = useState(false);
    
    const [usuarioId, setUsuarioId] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const { data: usuariosData } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => usuarioService.getAll(),
    });
    const usuarios = Array.isArray(usuariosData) ? usuariosData : (usuariosData?.items || []);

    const { data: auditoriaData, isLoading } = useQuery({
        queryKey: ['auditoria', page, limit, search, usuarioId, fechaDesde, fechaHasta],
        queryFn: () => auditoriaService.getAll(page, limit, {
            search: search || undefined,
            usuario_id: usuarioId ? Number(usuarioId) : undefined,
            fecha_desde: fechaDesde || undefined,
            fecha_hasta: fechaHasta || undefined,
        }),
    });

    const auditoria = auditoriaData?.items || [];
    const totalRegistros = auditoriaData?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1);
    };

    const hayFiltros = searchTerm !== '' || usuarioId !== '' || fechaDesde !== '' || fechaHasta !== '';

    const limpiarFiltros = () => {
        setSearchTerm('');
        setSearch('');
        setUsuarioId('');
        setFechaDesde('');
        setFechaHasta('');
        setPage(1);
    };

    const nombreUsuario = (id) => {
        const u = usuarios.find((u) => String(u.id) === String(id));
        return u ? (u.nombre_completo || u.nombre || u.username || u.email || `Usuario ${id}`) : id ?? '—';
    };

    const traducirAccion = (accion) => {
        if (!accion) return '—';
        const acc = accion.toUpperCase();
        if (acc.includes('INSERT') || acc.includes('CREATE')) return 'Creación';
        if (acc.includes('UPDATE')) return 'Modificación';
        if (acc.includes('DELETE')) return 'Eliminación';
        return accion;
    };

    const columnas = [
        { key: "fecha", label: "Fecha", render: (row) => formatFecha(row.fecha) },
        { key: "usuario_id", label: "Usuario", render: (row) => nombreUsuario(row.usuario_id) },
        { key: "accion", label: "Acción", render: (row) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                ${row.accion?.toUpperCase().includes('INSERT') ? 'bg-green-100 text-green-800' : 
                  row.accion?.toUpperCase().includes('DELETE') ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'}`}>
                {traducirAccion(row.accion)}
            </span>
        ) },
        { key: "tabla_afectada", label: "Sección (Tabla)", render: (row) => <span className="capitalize">{row.tabla_afectada}</span> },
        {
            key: "acciones",
            label: "",
            render: (row) => (
                <Button
                    variant="outline"
                    className="px-2 py-1 h-8"
                    onClick={() => setDetalleSeleccionado(row)}
                >
                    <Eye size={16} className="text-blue-600 mr-1" /> Ver detalle
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Auditorías</h1>
                <p className="text-muted-foreground text-sm mt-1">Historial de movimientos y acciones en el sistema.</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar sección o detalle..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowFilters(!showFilters)} 
                            className="w-full sm:w-auto"
                        >
                            <Filter size={18} className="mr-2" />
                            Filtros {(usuarioId || fechaDesde || fechaHasta) && "(Activos)"}
                        </Button>
                        
                        {hayFiltros && (
                            <Button 
                                variant="outline" 
                                onClick={limpiarFiltros} 
                                className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <X size={18} className="mr-2" /> Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-border animate-in slide-in-from-top-2">
                        
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Usuario</label>
                            <select 
                                value={usuarioId} 
                                onChange={handleFilterChange(setUsuarioId)}
                                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">Todos los usuarios</option>
                                {usuarios.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.nombre_completo || u.nombre || u.username || u.email || `Usuario ${u.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Desde</label>
                            <input 
                                type="date" 
                                value={fechaDesde} 
                                max={fechaHasta || undefined}
                                onChange={handleFilterChange(setFechaDesde)}
                                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Hasta</label>
                            <input 
                                type="date" 
                                value={fechaHasta} 
                                min={fechaDesde || undefined}
                                onChange={handleFilterChange(setFechaHasta)}
                                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                            />
                        </div>
                        
                    </div>
                )}
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Buscando...</div>
                ) : (
                    <DataTable columns={columnas} data={auditoria} />
                )}

                {!isLoading && totalPages > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
                        <span className="text-sm text-muted-foreground">
                            Mostrando página {page} de {totalPages || 1}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="px-2 py-1 h-8"
                                disabled={page === 1 || isLoading}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft size={18} />
                            </Button>
                            <Button
                                variant="outline"
                                className="px-2 py-1 h-8"
                                disabled={page >= totalPages || totalPages === 0 || isLoading}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {detalleSeleccionado && (
                <AuditoriaDetalleModal
                    item={detalleSeleccionado}
                    onClose={() => setDetalleSeleccionado(null)}
                />
            )}
        </div>
    );
}