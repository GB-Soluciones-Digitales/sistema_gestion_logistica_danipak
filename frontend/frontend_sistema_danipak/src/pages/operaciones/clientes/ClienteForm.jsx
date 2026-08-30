import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { clientesServices } from '../../../api/clientesServices';

export default function ClienteForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(isEditing);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      razon_social: '',
      cuit_dni: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: true
    }
  });

  useEffect(() => {
    if (!isEditing) return;
    const fetchCliente = async () => {
      try {
        const data = await clientesServices.getById(id);
        reset(data);
      } catch (error) {
        toast.error("Error al cargar el cliente.");
        console.error("Error al cargar el cliente.", error)
        navigate('/clientes');
      } finally {
        setLoadingData(false);
      }
    };
    fetchCliente();
  }, [id, isEditing, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await clientesServices.updateClientes(id, data);
        toast.success("Cliente actualizado exitosamente");
      } else {
        await clientesServices.createClientes(data);
        toast.success("Cliente creado exitosamente");
      }
      navigate('/clientes');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Ocurrió un error al guardar");
    }
  };

  if (loadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Razón Social / Nombre *</label>
              <input 
                type="text" 
                {...register("razon_social", { required: "Este campo es obligatorio" })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.razon_social && <span className="text-destructive text-xs mt-1">{errors.razon_social.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">CUIT / DNI *</label>
              <input 
                type="text" 
                {...register("cuit_dni", { required: "Este campo es obligatorio" })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
              {errors.cuit_dni && <span className="text-destructive text-xs mt-1">{errors.cuit_dni.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Dirección</label>
              <input 
                type="text" 
                {...register("direccion")}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Teléfono</label>
              <input 
                type="text" 
                {...register("telefono")}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input 
                type="email" 
                {...register("email")}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-border mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  {...register("estado")}
                  className="w-4 h-4 text-primary rounded border-input focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">Cliente Activo</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/clientes')}
            className="px-6 py-2 border border-border rounded-md font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  );
}