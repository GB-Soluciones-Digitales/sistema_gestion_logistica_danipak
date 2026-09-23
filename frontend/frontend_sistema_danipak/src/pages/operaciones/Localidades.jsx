import { useState, useEffect } from 'react';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { localidadService } from '../../api/localidadService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';

export default function Localidades() {
    const queryClient = useQueryClient();
    
    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        codigo_postal: '',
        estado: true
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1);
        }, 500);
            return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const { data, isLoading } = useQuery({
        queryKey: ['localidades', page, limit, search],
        queryFn: () => localidadService.getAll(page, limit, search),
    });

    const localidades = data?.items || [];
    const totalRegistros = data?.total || 0;
    const totalPages = Math.ceil(totalRegistros / limit);

    const createMutation = useMutation({
        mutationFn: (nuevaLocalidad) => localidadService.createLocalidad(nuevaLocalidad),
        onSuccess: () => {
            toast.success("Localidad creada con éxito");
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['localidades'] });
            queryClient.invalidateQueries({ queryKey: ['localidades-select'] });
        },
        onError: (err) => {
            toast.error("Error al guardar la localidad. Revisá los datos.");
            console.error('Error al guardar', err);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => localidadService.updateLocalidad(id, data),
        onSuccess: () => {
            toast.success("Localidad actualizada correctamente");
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['localidades'] });
            queryClient.invalidateQueries({ queryKey: ['localidades-select'] });
        },
        onError: (err) => {
            toast.error("Error al guardar la localidad. Revisá los datos.");
            console.error('Error al guardar', err);
        }
    });

    const abrirModalCrear = () => {
        setFormData({ nombre: '', codigo_postal: '', estado: true });
        setModoEdicion(false);
        setIdSeleccionado(null);
        setIsModalOpen(true);
    };

    const abrirModalEditar = (localidad) => {
        setFormData({ 
            nombre: localidad.nombre, 
            codigo_postal: localidad.codigo_postal || '',
            estado: localidad.estado 
        });
        setModoEdicion(true);
        setIdSeleccionado(localidad.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modoEdicion) {
            updateMutation.mutate({ id: idSeleccionado, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const columnas = [
        { key: 'nombre', label: 'Localidad' },
        { key: 'codigo_postal', label: 'CP' },
        { key: 'estado', label: 'Estado',
          render: (fila) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fila.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {fila.estado ? 'Activa' : 'Inactiva'}
            </span>
          )
        },
        { key: 'acciones', label: 'Acciones',
          render: (fila) => (
            <Button variant="outline" onClick={() => abrirModalEditar(fila)} className="px-2 py-1 h-8" title="Editar">
              <Edit2 size={16} className="text-amber-600" />
            </Button>
          )
        }
    ];

  return (
    <div className="space-y-6 pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Localidades</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de localidades frecuentes</p>
        </div>
        <Button onClick={abrirModalCrear} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nueva Localidad
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <DataTable columns={columnas} data={localidades} />
        )}

        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {localidades.length} de {totalRegistros} localidades
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="px-2 py-1 h-8"
                disabled={page === 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
              <Button 
                variant="outline" 
                className="px-2 py-1"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={modoEdicion ? "Editar Localidad" : "Crear Nueva Localidad"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nombre de la Localidad"
            placeholder="Ej: Paraná"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <Input 
            label="Código Postal"
            placeholder="Ej: 3100"
            value={formData.codigo_postal}
            onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
          />
          
          {modoEdicion && (
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input 
                type="checkbox"
                className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                checked={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
              />
              <span className="text-sm font-medium text-foreground">Localidad Activa</span>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}