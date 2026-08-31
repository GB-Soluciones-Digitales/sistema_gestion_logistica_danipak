import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { clientesServices } from '../../api/clientesServices';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { localidadService } from '../../api/localidadService';


export default function Clientes(){
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

    const[formData, setFormData] = useState({
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
        },500);
            return () => clearTimeout(delayDebounceFn);
        }, [searchTerm]);

        
    const fetchClientes = useCallback(async() =>{
        try{
            setLoading(true);
            const data = await clientesServices.getAll(page,limit,search);
            setClientes(data.items);
            setTotalRegistros(data.total);
        }catch(err){
            toast.error("Error al cargar los clientes")
            console.error('Error al cargar clientes',err);
        } finally{
            setLoading(false);
        }
    },[page, search,limit]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClientes();
    }, [fetchClientes]);


    const abrirModalCrear = () => {
        setFormData({razon_social:'',cuit_dni:'',dirreccion:'',telefono:'',email:'',estado: true});
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
        try{
            if(modoEdicion){
                await clientesServices.updateClientes(idSeleccionado, formData);
                toast.success("Cliente actualizado con exito");
            }else{
                await clientesServices.createClientes(formData);
                toast.success("Cliente creado con exito");
            }
            setIsModalOpen(false);
            fetchClientes();
        }catch(err) {
            toast.error("Error al guarddadr la localidad. Datos ingresados incorrectamente")
            console.error('Error al guardar',err)
        }
    };

    const columnas = [
        {key: 'id', label: 'Id'},
        {key: 'razon_social', label: 'Razon Social'},
        {key: 'cuit_dni', label: 'Cuit/Dni'},
        {key: 'telefono', label: 'Telefono'},
        {key: 'email', label: 'Correo Electronico'},
        {
        key: 'estado', 
        label: 'Estado',
        render:(fila) =>(
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

    const totalPage = Math.ceil(totalRegistros / limit);

    return (
    //Aca se me fundio el marolio pero entendi la mayoria y creo que lo adapte de la manera que corresponde cualquier cosa mañana a la mañana lo vemos despues lo del diseño de la pagina ya me quemaba mucho la cabeza
    //Depues lo que si medio me quemo pero entendi era eso de darle formato a cuando seleccionas la opicon correccta y la que no 
    //Despeus se que eso de los label y buttom es tema de como te gusta configurarlo
    // Despues otra cosa que no entedi muy bien fue lo de definir las colummnas
    // ATTE MIS DOS HUEVOS 
    );
    } 
 