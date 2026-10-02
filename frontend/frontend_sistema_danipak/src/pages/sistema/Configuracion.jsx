import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Building2, Phone, MapPin, Mail, Save, Loader2, KeyRound, EyeOff, Eye } from 'lucide-react';

import { empresaService } from '../../api/empresaService';
import { usuarioService } from '../../api/usuariosService';

export default function Configuracion() {
  const queryClient = useQueryClient();
  const EMPRESA_ID = 1;

  const {
    register: registerEmpresa,
    handleSubmit: handleSubmitEmpresa,
    reset: resetEmpresa,
    formState: { errors: errorsEmpresa, isDirty: isDirtyEmpresa }
  } = useForm({
    defaultValues: {
      nombre: 'DaniPak Logística',
      correo: 'administracion@danipak.com',
      telefono: '343 0000000',
      telefono_aux: '',
      direccion: 'Paraná, Entre Ríos'
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
      resetEmpresa(empresaActual);
    }
  }, [empresaActual, resetEmpresa]);

  const createMutation = useMutation({
    mutationFn: (data) => empresaService.createEmpresa(data),
    onSuccess: (newData) => {
      toast.success('Datos de la empresa creados correctamente.');
      queryClient.setQueryData(['empresa', EMPRESA_ID], newData);
      resetEmpresa(newData);
    },
    onError: () => toast.error('Error al guardar los datos.')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => empresaService.updateEmpresa(EMPRESA_ID, data),
    onSuccess: (newData) => {
      toast.success('Datos de la empresa actualizados correctamente.');
      queryClient.setQueryData(['empresa', EMPRESA_ID], newData);
      resetEmpresa(newData);
    },
    onError: () => toast.error('Error al actualizar los datos.')
  });

  const onSubmitEmpresa = (data) => {
    if (empresaActual) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSavingEmpresa = createMutation.isPending || updateMutation.isPending;

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    watch: watchPass,
    formState: { errors: errorsPass }
  } = useForm({
    defaultValues: { password_actual: '', password_nueva: '', confirmar_password: '' }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordNueva = watchPass('password_nueva');

  const passwordMutation = useMutation({
    mutationFn: (data) => usuarioService.changePassword(data),
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente.');
      resetPass(); 
    },
    onError: (error) => {
      const msj = error.response?.data?.detail || 'Error al actualizar la contraseña.';
      toast.error(msj);
    }
  });

  const onSubmitPassword = (data) => {
    passwordMutation.mutate({
      password_actual: data.password_actual,
      password_nueva: data.password_nueva
    });
  };

  if (isLoadingDatos) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Administrá los datos del sistema y la seguridad de tu cuenta.
        </p>
      </div>

      {/* TARJETA 1: DATOS DE LA EMPRESA */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            Datos Fiscales y de Contacto
          </h2>
        </div>

        <form onSubmit={handleSubmitEmpresa(onSubmitEmpresa)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Razón Social <span className="text-destructive">*</span></label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsEmpresa.nombre ? 'border-destructive' : 'border-input'}`}
                  {...registerEmpresa('nombre', { required: 'El nombre es obligatorio' })}
                />
              </div>
              {errorsEmpresa.nombre && <p className="text-xs text-destructive">{errorsEmpresa.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Correo Electrónico <span className="text-destructive">*</span></label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsEmpresa.correo ? 'border-destructive' : 'border-input'}`}
                  {...registerEmpresa('correo', { 
                    required: 'El correo es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
                  })}
                />
              </div>
              {errorsEmpresa.correo && <p className="text-xs text-destructive">{errorsEmpresa.correo.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono Principal <span className="text-destructive">*</span></label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsEmpresa.telefono ? 'border-destructive' : 'border-input'}`}
                  {...registerEmpresa('telefono', { required: 'El teléfono es obligatorio' })}
                />
              </div>
              {errorsEmpresa.telefono && <p className="text-xs text-destructive">{errorsEmpresa.telefono.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Teléfono Auxiliar (Opcional)</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                  {...registerEmpresa('telefono_aux')}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Dirección Comercial <span className="text-destructive">*</span></label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsEmpresa.direccion ? 'border-destructive' : 'border-input'}`}
                  {...registerEmpresa('direccion', { required: 'La dirección es obligatoria' })}
                />
              </div>
              {errorsEmpresa.direccion && <p className="text-xs text-destructive">{errorsEmpresa.direccion.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSavingEmpresa || !isDirtyEmpresa}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingEmpresa ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSavingEmpresa ? 'Guardando...' : 'Guardar Empresa'}
            </button>
          </div>
        </form>
      </div>

      {/* TARJETA 2: CAMBIO DE CONTRASEÑA */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <KeyRound size={20} className="text-primary" />
            Seguridad y Contraseña
          </h2>
        </div>

        <form onSubmit={handleSubmitPass(onSubmitPassword)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contraseña Actual <span className="text-destructive">*</span></label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  className={`w-full px-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsPass.password_actual ? 'border-destructive' : 'border-input'}`}
                  placeholder="••••••••"
                  {...registerPass('password_actual', { required: 'Requerida' })}
                />
                <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errorsPass.password_actual && <p className="text-xs text-destructive">{errorsPass.password_actual.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nueva Contraseña <span className="text-destructive">*</span></label>
              <input
                type={mostrarPassword ? "text" : "password"}
                className={`w-full px-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsPass.password_nueva ? 'border-destructive' : 'border-input'}`}
                placeholder="Mínimo 6 caracteres"
                {...registerPass('password_nueva', { 
                  required: 'Requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
              />
              {errorsPass.password_nueva && <p className="text-xs text-destructive">{errorsPass.password_nueva.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirmar Nueva <span className="text-destructive">*</span></label>
              <input
                type={mostrarPassword ? "text" : "password"}
                className={`w-full px-4 py-2 bg-background border rounded-md outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errorsPass.confirmar_password ? 'border-destructive' : 'border-input'}`}
                placeholder="Repita la nueva contraseña"
                {...registerPass('confirmar_password', { 
                  required: 'Requerida',
                  validate: value => value === passwordNueva || 'Las contraseñas no coinciden'
                })}
              />
              {errorsPass.confirmar_password && <p className="text-xs text-destructive">{errorsPass.confirmar_password.message}</p>}
            </div>

          </div>

          <div className="pt-4 flex justify-end border-t border-border mt-6">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              {passwordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}