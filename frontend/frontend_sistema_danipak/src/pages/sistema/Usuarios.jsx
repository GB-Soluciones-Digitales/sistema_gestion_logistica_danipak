import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { usuarioService } from '../../api/usuariosService';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import UsuarioForm from './UsuarioForm';

export default function Usuarios() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios', page, limit, search],
    queryFn: () => usuarioService.getAll(page, limit, search),
  });

  const usuarios = data?.items || [];
  const totalRegistros = data?.total || 0;
  const totalPages = Math.ceil(totalRegistros / limit);

  const createMutation = useMutation({
    mutationFn: (nuevoUsuario) => usuarioService.createUsuario(nuevoUsuario),
    onSuccess: () => {
      toast.success('Usuario creado correctamente.');
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => {
      const detail = error.response?.data?.detail;
      // En errores 422 de validación FastAPI devuelve una lista de objetos
      const msj = typeof detail === 'string'
        ? detail
        : Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : 'Error al crear el usuario.';
      toast.error(msj);
    }
  });

  const columnas = [
    { key: 'nombre_completo', label: 'Nombre' },
    { key: 'username', label: 'Usuario' },
    { key: 'email', label: 'Correo' },
    { key: 'estado', label: 'Estado', render: (fila) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fila.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {fila.estado ? 'Activo' : 'Inactivo'}
      </span>
    ) },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de las cuentas con acceso al sistema.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Nuevo Usuario
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar por usuario o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando usuarios...</div>
        ) : (
          <DataTable columns={columnas} data={usuarios} />
        )}

        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {usuarios.length} de {totalRegistros} usuarios
            </span>
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 h-8">
                <ChevronLeft size={18} />
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages}</span>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 h-8">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Usuario">
        <UsuarioForm
          onSubmit={(payload) => createMutation.mutate(payload)}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
