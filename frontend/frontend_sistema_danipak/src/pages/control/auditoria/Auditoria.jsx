import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { auditoriaService } from '../../../api/auditoriaServices';
import { usuarioService } from '../../../api/usuariosService';
import Button from '../../../components/ui/Button';
import DataTable from '../../../components/ui/DataTable';
import AuditoriaDetalleModal, { AccionBadge } from './AuditoriaDetalle';
import { resumenDetalles, formatFecha } from './AuditoriaDetalleUtils';

export default function Auditoria() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
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
            search,
            usuario_id: usuarioId,
            fecha_desde: fechaDesde,
            fecha_hasta: fechaHasta,
        }),
    });

    const auditoria = auditoriaData?.items || [];
    const totalRegistros = auditoriaData?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1);
    };

    const hayFiltros = searchTerm || usuarioId || fechaDesde || fechaHasta;

    const limpiarFiltros = () => {
        setSearchTerm('');
        setSearch('');
        setUsuarioId('');
        setFechaDesde('');
        setFechaHasta('');
        setPage(1);
    };

    const nombreUsuario = (id) => {
        const u = usuarios.find((u) => u.id === id);
        return u ? (u.nombre || u.username || u.email || `Usuario ${id}`) : id ?? '—';
    };

    const columnas = [
        { key: "id", label: "Id" },
        { key: "fecha", label: "Fecha", render: (row) => formatFecha(row.fecha) },
        { key: "usuario_id", label: "Usuario", render: (row) => nombreUsuario(row.usuario_id) },
        { key: "accion", label: "Acción", render: (row) => <AccionBadge accion={row.accion} /> },
        { key: "tabla_afectada", label: "Tabla" },
        { key: "registro_id", label: "Registro" },
        {
            key: "detalles_cambio",
            label: "Resumen",
            render: (row) => (
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs block">
                    {resumenDetalles(row.detalles_cambio)}
                </span>
            ),
        },
        {
            key: "acciones",
            label: "",
            render: (row) => (
                <Button
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    onClick={() => setDetalleSeleccionado(row)}
                >
                    <Eye size={14} /> Ver detalle
                </Button>
            ),
        },
    ];

    const inputClass = "border border-input rounded-md px-3 py-2 bg-background text-sm text-foreground focus:outline-none";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Auditorías</h1>
                <p className="text-muted-foreground text-sm mt-1">Historial de Auditorías Realizadas.</p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex items-center gap-2 w-full max-w-xs border border-input rounded-md px-3 py-2 bg-background">
                    <Search size={18} className="text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar tabla, acción o detalle..."
                        className="w-full bg-transparent focus:outline-none text-sm text-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className={inputClass}
                    value={usuarioId}
                    onChange={handleFilterChange(setUsuarioId)}
                >
                    <option value="">Todos los usuarios</option>
                    {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.nombre || u.username || u.email || `Usuario ${u.id}`}
                        </option>
                    ))}
                </select>

                <label className="flex flex-col text-xs text-muted-foreground gap-1">
                    Desde
                    <input
                        type="date"
                        className={inputClass}
                        value={fechaDesde}
                        max={fechaHasta || undefined}
                        onChange={handleFilterChange(setFechaDesde)}
                    />
                </label>

                <label className="flex flex-col text-xs text-muted-foreground gap-1">
                    Hasta
                    <input
                        type="date"
                        className={inputClass}
                        value={fechaHasta}
                        min={fechaDesde || undefined}
                        onChange={handleFilterChange(setFechaHasta)}
                    />
                </label>

                {hayFiltros && (
                    <Button variant="outline" className="px-3 py-2" onClick={limpiarFiltros}>
                        <X size={16} /> Limpiar
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Buscando...</div>
            ) : (
                <DataTable columns={columnas} data={auditoria} />
            )}

            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                    Mostrando {auditoria.length} de {totalRegistros} Auditorías
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="px-2 py-1"
                        disabled={page === 1 || isLoading}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        className="px-2 py-1"
                        disabled={page >= totalPages || totalPages === 0 || isLoading}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>

            <AuditoriaDetalleModal
                item={detalleSeleccionado}
                onClose={() => setDetalleSeleccionado(null)}
            />
        </div>
    );
}