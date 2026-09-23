import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { empresaService } from '../../api/empresaServices';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';


export default function Empresa() {
    const [empresas, setEmpresas] = useState([]);
    const [totalRegistros, setTotalRegistros] = useState(0);
    const [loading, setLoading] = useState(true);
    

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState(null);
    
    const{ register, handleSubmit,reset, formState:{errors,isSubtting}} = useForm({
       defautlValues:{
         nombre: "",
         telefono: "",
         telefono_aux: "",
         dirreccion :"",
         correo: ""
        }
    });

    const fetchEmpresa = useCallback(async () =>{
        try {
            setLoading(true);
            const data = await empresaService.getById(1);
            setEmpresas(data.items);
        }
         catch(err) {
            toast.error("Error al cargar los datos de la empresa");
            console.error("Error al cargar los datos", err);
        } finally{
            setLoading(false);
        }
    });

    useEffect(() => {
        //eslint-disable-next-line raect-hook/set-state-in-effect
        fetchEmpresa();
    }, [fetchEmpresa]);

    const abrirModalEditar = (empresa) => {
        setFormData({
            nombre: empresa.nombre,
            telefono: empresa.telefono,
            telefono_aux: empresa.telefono_aux,
            dirreccion: empresa.dirreccion,
            correo: empresa.correo
        });
        setIdSeleccionado(empresa.id);
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        e.preventDefault();
        try {
            await empresaService.updateEmpresa(idSeleccionado,data);
            toast.success("Datos actualizados correctamente");
        } catch(err) {
            toast.error("Error al actualziar los datos. Revise los datos");
            console.error("Error al guardar", err);
            
        }
    };

    const columnas = [
        { key: "nombre", label: "Empresa" },
        { key: "telefono", label: "Telefono"},
        { key: "telefono_aux", label: "Telefono auxiliar"},
        { key: "dirreccion", label: "Dirreccion"},
        { key: "correo", label: "Correo"}
    ];

return (
    <div className='space-y-6 pb-10'>

        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
             <h1 className='text-2xl font-display font-bold text-foreground'>DaniPack</h1>
              <p className='text-muted-foreground text-sm mt-1'> Gestion de los datos de la empresa</p>
          </div>  
       </div>
       <Button onClick={abrirModalEditar} className='w-full sm:w-auto'>
            <Plus size={20} className="mr-2" />
            Editar Empresa
       </Button>
       
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className='bg-card p-6 rounded-lg border border-border shadow-sm space-y-4'>
             <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                 <Input
                    label="Nombre"
                    error={errors.nombre?.message}

             </div>

          </div>

       </form>

    </div>
);
}

