import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { usuarioService } from '../../api/usuariosService';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import UsuarioForm from './UsuarioForm';

export default function Usuarios() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioAToggle, setUsuarioAToggle] = useState(null);

  const { data: miPerfil } = useQuery({
    queryKey: ['mi-perfil'],
    queryFn: () => usuarioService.getMe(),
    retry: false,
  });

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

  // En errores 422 de validación FastAPI devuelve una lista de objetos
  const mensajeError = (error, porDefecto) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join(', ');
    return porDefecto;
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setUsuarioEditando(null);
  };

  const createMutation = useMutation({
    mutationFn: (nuevoUsuario) => usuarioService.createUsuario(nuevoUsuario),
    onSuccess: () => {
      toast.success('Usuario creado correctamente.');
      cerrarModal();
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => toast.error(mensajeError(error, 'Error al crear el usuario.'))
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usuarioService.updateUsuario(id, data),
    onSuccess: () => {
      toast.success('Usuario actualizado correctamente.');
      cerrarModal();
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['mi-perfil'] });
    },
    onError: (error) => toast.error(mensajeError(error, 'Error al actualizar el usuario.'))
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }) => usuarioService.updateUsuario(id, { estado }),
    onSuccess: (_, { estado }) => {
      toast.success(estado ? 'Usuario desbloqueado.' : 'Usuario bloqueado.');
      setUsuarioAToggle(null);
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error) => {
      setUsuarioAToggle(null);
      toast.error(mensajeError(error, 'Error al cambiar el estado del usuario.'));
    }
  });

  const abrirEdicion = (usuario) => {
    setUsuarioEditando(usuario);
    setIsModalOpen(true);
  };

  const confirmarCambioEstado = () => {
    estadoMutation.mutate({ id: usuarioAToggle.id, estado: !usuarioAToggle.estado });
  };

  const columnas = [
    { key: 'nombre_completo', label: 'Nombre' },
    { key: 'username', label: 'Usuario' },
    { key: 'email', label: 'Correo' },
    { key: 'estado', label: 'Estado', render: (fila) => (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fila.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {fila.estado ? 'Activo' : 'Inactivo'}
      </span>
    ) },
    { key: 'acciones', label: 'Acciones', render: (fila) => (
      <div className="flex gap-1">
        <Button variant="outline" onClick={() => abrirEdicion(fila)} className="px-2 py-1 h-8" title="Editar">
          <Pencil size={16} className="text-amber-600" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setUsuarioAToggle(fila)}
          disabled={fila.id === miPerfil?.id || estadoMutation.isPending}
          className="px-2 py-1 h-8"
          title={fila.id === miPerfil?.id ? 'No podés bloquear tu propio usuario' : fila.estado ? 'Bloquear' : 'Desbloquear'}
        >
          {fila.estado
            ? <Ban size={16} className="text-red-600" />
            : <CheckCircle size={16} className="text-green-600" />}
        </Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de las cuentas con acceso al sistema.</p>
        </div>
        <Button onClick={() => { setUsuarioEditando(null); setIsModalOpen(true); }}>
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

      <Modal isOpen={isModalOpen} onClose={cerrarModal} title={usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <UsuarioForm
          key={usuarioEditando?.id ?? 'nuevo'}
          usuario={usuarioEditando}
          onSubmit={(payload) => usuarioEditando
            ? updateMutation.mutate({ id: usuarioEditando.id, data: payload })
            : createMutation.mutate(payload)}
          onCancel={cerrarModal}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        open={usuarioAToggle !== null}
        title={usuarioAToggle?.estado ? '¿Bloquear usuario?' : '¿Desbloquear usuario?'}
        message={usuarioAToggle?.estado
          ? `${usuarioAToggle?.username} no podrá iniciar sesión hasta que lo desbloquees.`
          : `${usuarioAToggle?.username} volverá a poder iniciar sesión.`}
        confirmText={usuarioAToggle?.estado ? 'Sí, bloquear' : 'Sí, desbloquear'}
        variant={usuarioAToggle?.estado ? 'danger' : 'default'}
        onConfirm={confirmarCambioEstado}
        onCancel={() => setUsuarioAToggle(null)}
      />
    </div>
  );
}
