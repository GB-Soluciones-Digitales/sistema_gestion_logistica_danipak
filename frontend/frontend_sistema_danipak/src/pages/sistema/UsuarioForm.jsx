import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function UsuarioForm({ usuario = null, onSubmit, onCancel, isSubmitting }) {
  const esEdicion = !!usuario;
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nombre_completo: usuario?.nombre_completo ?? '',
      username: usuario?.username ?? '',
      email: usuario?.email ?? '',
      password: '',
      confirmar_password: ''
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password');

  const submit = (data) => {
    const payload = {
      nombre_completo: data.nombre_completo.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
    };
    if (esEdicion) {
      // En edición la contraseña es opcional: si queda vacía no se modifica.
      if (data.password) payload.password = data.password;
    } else {
      payload.password = data.password;
      payload.estado = true;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input
        label="Nombre completo *"
        placeholder="Ej: Juan Pérez"
        error={errors.nombre_completo?.message}
        {...register('nombre_completo', { required: 'El nombre es obligatorio' })}
      />

      <Input
        label="Nombre de usuario *"
        placeholder="Ej: jperez"
        autoComplete="off"
        error={errors.username?.message}
        {...register('username', { required: 'El usuario es obligatorio' })}
      />

      <Input
        label="Correo electrónico *"
        type="email"
        placeholder="usuario@danipak.com"
        autoComplete="off"
        error={errors.email?.message}
        {...register('email', {
          required: 'El correo es obligatorio',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
        })}
      />

      <div className="relative">
        <Input
          label={esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
          type={mostrarPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: esEdicion ? false : 'La contraseña es obligatoria',
            minLength: { value: 6, message: 'Mínimo 6 caracteres' }
          })}
        />
        <button
          type="button"
          onClick={() => setMostrarPassword(!mostrarPassword)}
          className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground"
        >
          {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <Input
        label={esEdicion ? 'Confirmar nueva contraseña' : 'Confirmar contraseña *'}
        type={mostrarPassword ? 'text' : 'password'}
        placeholder="Repita la contraseña"
        autoComplete="new-password"
        error={errors.confirmar_password?.message}
        {...register('confirmar_password', {
          required: esEdicion ? false : 'Requerida',
          validate: (value) => value === password || 'Las contraseñas no coinciden'
        })}
      />

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  );
}
