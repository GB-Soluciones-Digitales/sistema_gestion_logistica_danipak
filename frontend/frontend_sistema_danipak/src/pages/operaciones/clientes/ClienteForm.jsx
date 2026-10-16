import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { clientesServices } from '../../../api/clientesServices';
import { localidadService } from '../../../api/localidadService'; 
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function ClienteForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [localidades, setLocalidades] = useState([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      razon_social: '',
      cuit_dni: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: true,
      tiene_cuenta_corriente: false,
      localidad_id: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLocalidades = await localidadService.getAll(1, 1000);
        setLocalidades((resLocalidades.items || []).filter(l => l.estado === true));

        if (isEditing) {
          const data = await clientesServices.getById(id);
          reset({
            ...data,
            localidad_id: data.localidad_id || ''
          });
        }
      } catch (error) {
        toast.error("Error al cargar los datos.");
        console.error("Error", error);
        if (isEditing) navigate('/clientes');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, [id, isEditing, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, localidad_id: data.localidad_id ? parseInt(data.localidad_id) : null };
      
      if (isEditing) {
        await clientesServices.updateClientes(id, payload);
        toast.success("Cliente actualizado exitosamente");
      } else {
        await clientesServices.createClientes(payload);
        toast.success("Cliente creado exitosamente");
      }
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      navigate('/clientes');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Ocurrió un error al guardar");
    }
  };

  if (loadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <button onClick={() => navigate('/clientes')} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Razón Social / Nombre *"
              error={errors.razon_social?.message}
              {...register("razon_social", { required: "Este campo es obligatorio" })}
            />
            <Input 
              label="CUIT / DNI *"
              error={errors.cuit_dni?.message}
              {...register("cuit_dni", { required: "Este campo es obligatorio" })}
            />
            <Input 
              label="Dirección"
              {...register("direccion")}
            />
            
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Localidad</label>
                <select 
                  {...register("localidad_id")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccione una localidad...</option>
                  {localidades.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
            </div>

            <Input 
              label="Teléfono"
              {...register("telefono")}
            />
            <Input 
              type="email"
              label="Email"
              {...register("email")}
            />
          </div>

          <div className="pt-4 border-t border-border mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  {...register("estado")}
                  className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">Cliente Activo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2"> 
                <input 
                  type="checkbox"
                  {...register("tiene_cuenta_corriente")}
                  className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">Tiene Cuenta Corriente</span>
              </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/clientes')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar Cliente
          </Button>
        </div>
      </form>
    </div>
  );
}