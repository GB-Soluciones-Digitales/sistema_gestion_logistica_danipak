import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
import { auditoriaService } from '../../api/auditoriaServices';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';

export default function Auditoria() {
    const [auditoria, setAuditoria] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchAuditorias = useCallback(async () => {
        try {
            setLoading(true);
            const data = await auditoriaService.getAll(page, limit, search);
            setAuditoria(data.items || []);
            setTotalRegistros(data.total);
        } catch (err) {
            toast.error("Error al cargar las auditorias");
            console.error("Error al cargar Auditorias", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, limit]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAuditorias();
    }, [fetchAuditorias]);

    const columnas = [
        { key: "usuario_id", label: "Usuario ID" },
        { key: "tabla_afectada", label: "Tabla Afectada" },
        { key: "registro_id", label: "Registro ID" },
        {
            key: "detalles_cambio",
            label: "Detalles Cambio",
            render: (row) => {
                const detalles = row.detalles_cambio;
                if (detalles === null || detalles === undefined) return "-";
                return (
                    <pre className="text-xs whitespace-pre-wrap max-w-md">
                        {typeof detalles === 'object'
                            ? JSON.stringify(detalles, null, 2)
                            : detalles}
                    </pre>
                );
            },
        },
        { key: "fecha", label: "Fecha" },
    ];

    const totalPages = Math.ceil(totalRegistros / limit);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Auditorias</h1>
                <p className="text-muted-foreground text-sm mt-1">Historial de Auditorias Realizadas.</p>
            </div>

            <div className="flex items-center gap-2 max-w-sm border border-input rounded-md px-3 py-2 bg-background">
                <Search size={18} className="text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar por..."
                    className="w-full bg-transparent focus:outline-none text-sm text-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && auditoria.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Buscando...</div>
            ) : (
                <DataTable columns={columnas} data={auditoria} />
            )}

            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                    Mostrando {auditoria.length} de {totalRegistros} Auditorias
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="px-2 py-1"
                        disabled={page === 1 || loading}
                        onClick={() => setPage(p => p - 1)}
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        className="px-2 py-1"
                        disabled={page === totalPages || totalPages === 0 || loading}
                        onClick={() => setPage(p => p + 1)}
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}