import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Phone, MapPin, Mail, Save, Loader2 } from 'lucide-react';

import { empresaService } from '../../services/empresaService';

export default function Configuracion() {
  const queryClient = useQueryClient();
  const EMPRESA_ID = 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      nombre: '',
      correo: '',
      telefono: '',
      telefono_aux: '',
      direccion: ''
    }
  });

  const { data: empresaActual, isLoading: isLoadingDatos } = useQuery({
    queryKey: ['empresa', EMPRESA_ID],
    queryFn: () => empresaService.getById(EMPRESA_ID),
    retry: false,
    staleTime: 1000 * 60 * 30, 
  });

  useEffect(() => {
    if (empresaActual) {
      reset(empresaActual);
    }
  }, [empresaActual, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => empresaService.createEmpresa(data),
    onSuccess: (newData) => {
      toast.success('Datos de la empresa creados correctamente.');
      queryClient.setQueryData(['empresa', EMPRESA_ID], newData);
      reset(newData);
    },
    onError: () => toast.error('Error al guardar los datos.')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => empresaService.updateEmpresa(EMPRESA_ID, data),
    onSuccess: (newData) => {
      toast.success('Datos de la empresa actualizados correctamente.');
      queryClient.setQueryData(['empresa', EMPRESA_ID], newData);
      reset(newData);
    },
    onError: () => toast.error('Error al actualizar los datos.')
  });

  const onSubmit = (data) => {
    if (empresaActual) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoadingDatos) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Estos datos se utilizarán para generar los encabezados de los comprobantes y reportes en PDF.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            Datos Fiscales y de Contacto
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Razón Social / Nombre Comercial <span className="text-destructive">*</span></label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.nombre ? 'border-destructive' : 'border-input'}`}
                  placeholder="Ej: DaniPak Logística"
                  {...register('nombre', { required: 'El nombre es obligatorio' })}
                />
              </div>
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Correo Electrónico <span className="text-destructive">*</span></label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.correo ? 'border-destructive' : 'border-input'}`}
                  placeholder="administracion@danipak.com"
                  {...register('correo', { 
                    required: 'El correo es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
                  })}
                />
              </div>
              {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono Principal <span className="text-destructive">*</span></label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.telefono ? 'border-destructive' : 'border-input'}`}
                  placeholder="Ej: 343 4123456"
                  {...register('telefono', { required: 'El teléfono es obligatorio' })}
                />
              </div>
              {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono Auxiliar (Opcional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Ej: 343 4987654"
                  {...register('telefono_aux')}
                />
              </div>
            </div>
          </div>

          {/* Fila 3 */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Dirección Comercial <span className="text-destructive">*</span></label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.direccion ? 'border-destructive' : 'border-input'}`}
                  placeholder="Ej: Av. Las Américas 1234, Paraná"
                  {...register('direccion', { required: 'La dirección es obligatoria' })}
                />
              </div>
              {errors.direccion && <p className="text-xs text-destructive">{errors.direccion.message}</p>}
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}