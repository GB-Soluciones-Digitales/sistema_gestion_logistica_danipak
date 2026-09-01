import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { clientesServices } from '../../api/clientesServices';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const limit = 10;
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState(null);

    const [formData, setFormData] = useState({
        razon_social: '',
        cuit_dni: '',
        dirreccion: '',
        telefono: '',
        email: '',
        estado: true
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);


    const fetchClientes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await clientesServices.getAll(page, limit, search);
            setClientes(data.items || []);
            setTotalRegistros(data.total);
        } catch (err) {
            toast.error("Error al cargar los clientes")
            console.error('Error al cargar clientes', err);
        } finally {
            setLoading(false);
        }
    }, [page, search, limit]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClientes();
    }, [fetchClientes]);


    const abrirModalCrear = () => {
        setFormData({ razon_social: '', cuit_dni: '', dirreccion: '', telefono: '', email: '', estado: true });
        setModoEdicion(false);
        setIdSeleccionado(null);
        setIsModalOpen(true);
    };

    const abrirModalEditar = (cliente) => {
        setFormData({
            razon_social: cliente.razon_social,
            cuit_dni: cliente.cuit_dni,
            dirreccion: cliente.dirreccion,
            telefono: cliente.telefono,
            email: cliente.email,
            estado: cliente.estado
        });
        setModoEdicion(true);
        setIdSeleccionado(cliente.id);
        setIsModalOpen(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefautl();
        try {
            if (modoEdicion) {
                await clientesServices.updateClientes(idSeleccionado, formData);
                toast.success("Cliente actualizado con exito");
            } else {
                await clientesServices.createClientes(formData);
                toast.success("Cliente creado con exito");
            }
            setIsModalOpen(false);
            fetchClientes();
        } catch (err) {
            toast.error("Error al guarddadr la localidad. Datos ingresados incorrectamente")
            console.error('Error al guardar', err)
        }
    };

    const columnas = [
        { key: 'id', label: 'Id' },
        { key: 'razon_social', label: 'Razon Social' },
        { key: 'cuit_dni', label: 'Cuit/Dni' },
        { key: 'telefono', label: 'Telefono' },
        { key: 'email', label: 'Correo Electronico' },
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

            <div className="flex felx-col sm:flex-row justify-between items start sm:items-center gap-4">
                <div>
                    <h1 className="text-2x1 font-display font-bold text-foreground">Clientes</h1>
                </div>
                <Button onClick={abrirModalCrear}>
                    <Plus size={20} className="mr-2" />
                    Nuevo Cliente
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

            {loading && clientes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Buscando...</div>
            ) : (
                <DataTable columns={columnas} data={clientes} />
            )}

            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                    Mostrando {clientes.length} de {totalRegistros} clientes
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
              title={modoEdicion ? "Editar Cliente" : "Crear Nuevo Cliente"}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Razon Social"
                  placeholder= "Ej: DaniPack"
                  required
                  value={formData.razon_social}
                  onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                />
                <Input
                  label="Cuit/Dni"
                  placeholder= "Ej: 43937058"
                  required
                  value={formData.cuit_dni}
                  onChange={(e) => setFormData({...formData,cuit_dni: e.target.value})}
                />
                <Input
                  label="Domicilio o Residencia"
                  placeholder="Ej: Av Almafuerte 398"
                  value={formData.dirreccion}
                  onChange={(e) => setFormData({...formData,dirreccion: e.target.value})}
                />
                <Input
                  label="Telefono o Numero Celular"
                  placeholder="Ej: 343464...."
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData,telefono: e.target.value})}
                />
                <Input
                  label="Correo electronico o email"
                  placeholder= "Ej: ejemploX@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData,email: e.target.value})}
                />

                {modoEdicion &&(
                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                      checked={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.checked})}
                    />
                    <span className="text-sm font-medium text-foreground">Cliente Activo(Disponible para realizar pedidos)</span>
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
