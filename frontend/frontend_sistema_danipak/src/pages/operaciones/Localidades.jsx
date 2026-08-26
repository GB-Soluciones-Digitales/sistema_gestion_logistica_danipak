import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { localidadService } from '../../api/localidadService';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';

export default function Localidades() {
    const [localidades, setLocalidades] = useState([]); // Aca guardamos las localidades 
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Controles de Paginacion y busqueda
    const [page, setPage] = useState(1);
    const limit = 10; // Cantidad de filas por pagina
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Lo que se escribe antes de enviar al back

    const [isModalOpen, setIsModalOpen] = useState(false); // Controlamos la modal
    const [modoEdicion, setModoEdicion] = useState(false); // Para saber si estamos creando o editando
    const [idSeleccionado, setIdSeleccionado] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        codigo_postal: '',
        estado: true
    });

    // Genera un efecto retraso, espera medio segundo después de que el usuario deja de escribir para buscar
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1); // Si busco algo nuevo, vuelvo a la pagina 1
        }, 500);
            return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Esta es una funcion, llama al backend para que busque todas las localidades
    const fetchLocalidades = useCallback(async () => {
        try {
            setLoading(true);
            const data = await localidadService.getAll(page, limit, search);
            setLocalidades(data.items);
            setTotalRegistros(data.total);
        } catch (err) {
            toast.error('Error al cargar las localidades')
            console.error('Error al cargar localidades', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, limit]);

    // Esto hace que se ejecute una sola vez al entrar
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLocalidades();
    }, [fetchLocalidades]);

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

    // Esta funcion se dispara cuando apretamos guardar
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        try {
            if (modoEdicion) {
                await localidadService.updateLocalidad(idSeleccionado, formData);
                toast.success("Localidad actualizada correctamente");
            } else {
                await localidadService.createLocalidad(formData);
                toast.success("Localidad creada con éxito");
            }
            setIsModalOpen(false);
            fetchLocalidades();
        } catch (err) {
            toast.error("Error al guardar la localidad. Revisá los datos.");
            console.error('Error al guardar', err)
        }
    };

    // Aca pasamos los columnas a escribir
    const columnas = [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Localidad' },
        { key: 'codigo_postal', label: 'CP' },
        { 
        key: 'estado', 
        label: 'Estado',
        render: (fila) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${fila.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {fila.estado ? 'Activa' : 'Inactiva'}
            </span>
        )
        },
        { 
        key: 'acciones', 
        label: 'Acciones',
        render: (fila) => (
            <Button variant="outline" onClick={() => abrirModalEditar(fila)} className="px-2 py-1 h-8">
            <Edit2 size={16} className="text-muted-foreground" />
            </Button>
        )
        }
    ];

    const totalPages = Math.ceil(totalRegistros / limit);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Localidades</h1>
        </div>
        <Button onClick={abrirModalCrear}>
          <Plus size={20} className="mr-2" />
          Nueva Localidad
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm border border-input rounded-md px-3 py-2 bg-background">
        <Search size={18} className="text-muted-foreground" />
        <input 
          type="text"
          placeholder="Buscar por nombre..."
          className="w-full bg-transparent focus:outline-none text-sm text-foreground"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && localidades.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">Buscando...</div>
      ) : (
        <DataTable columns={columnas} data={localidades} />
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-muted-foreground">
          Mostrando {localidades.length} de {totalRegistros} localidades
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
              <span className="text-sm font-medium text-foreground">Localidad Activa (Disponible para envíos)</span>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}