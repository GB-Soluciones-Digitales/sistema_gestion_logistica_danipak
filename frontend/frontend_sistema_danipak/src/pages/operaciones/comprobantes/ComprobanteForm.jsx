import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { comprobantesService } from '../../../api/comprobantesService';
import { localidadService } from '../../../api/localidadService';
import { clientesServices } from '../../../api/clientesServices';

export default function ComprobanteForm() {
  const { id } = useParams(); 
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [localidades, setLocalidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [cargandoNumero, setCargandoNumero] = useState(false);

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      estado: 'Emitido',
      tipo: '',
      cantidad_bultos: 1,
      fecha_emision: new Date().toISOString().split('T')[0] 
    }
  });

  const tipoSeleccionado = useWatch({
    control,
    name: "tipo"
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [resLocalidades, resClientes] = await Promise.all([
          localidadService.getAll(1, 1000),
          clientesServices.getAll(1, 1000)
        ]);

        setLocalidades(resLocalidades.items || []);
        setClientes(resClientes.items || []);

        if (isEditing) {
          const comprobante = await comprobantesService.getById(id);
          const formattedDate = comprobante.fecha_emision.split('T')[0];
          reset({
            ...comprobante,
            fecha_emision: formattedDate
          });
        }
      } catch (error) {
        toast.error("Error al cargar los datos iniciales.");
        console.log("Error al cargar los datos", error)
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditing, reset]);

  useEffect(() => {
    if (isEditing) return;

    const calcularProximoNumero = async () => {
      if (tipoSeleccionado === "Comprobante de Envío") {
        setCargandoNumero(true);
        try {
          const res = await comprobantesService.getUltimoNumero(); 
          
          const partes = res.ultimo_numero.split('-');
          if (partes.length === 2) {
            const siguienteNumero = parseInt(partes[1], 10) + 1;
            const nuevoCorrelativo = String(siguienteNumero).padStart(8, '0');
            const numeroFinal = `${partes[0]}-${nuevoCorrelativo}`;
            
            setValue("numero_comprobante", numeroFinal);
          }
        } catch (error) {
          toast.error("Error al obtener el número correlativo");
          console.error("Error al obtener el número correlativo", error)
        } finally {
          setCargandoNumero(false);
        }
      } else if (tipoSeleccionado === "Remito") {
        setValue("numero_comprobante", "");
      }
    };

    calcularProximoNumero();
  }, [tipoSeleccionado, isEditing, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        cliente_remitente_id: parseInt(data.cliente_remitente_id),
        localidad_remitente_id: parseInt(data.localidad_remitente_id),
        localidad_destinatario_id: parseInt(data.localidad_destinatario_id),
        cantidad_bultos: parseInt(data.cantidad_bultos),
        importe_contra_reembolso: data.importe_contra_reembolso ? parseFloat(data.importe_contra_reembolso) : 0,
        importe_flete_pago: data.importe_flete_pago ? parseFloat(data.importe_flete_pago) : 0,
        importe_flete_cobro: data.importe_flete_cobro ? parseFloat(data.importe_flete_cobro) : 0,
      };

      if (isEditing) {
        toast.info("Función de edición completa requiere ajuste en el backend");
      } else {
        await comprobantesService.createComprobante(payload);
        toast.success("Comprobante creado exitosamente");
        navigate('/comprobantes');
      }
      
    } catch (error) {
      toast.error(error.response?.data?.detail || "Ocurrió un error al guardar");
    }
  };

  if (loadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <button onClick={() => navigate('/comprobantes')} className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isEditing ? 'Editar Comprobante' : 'Nuevo Comprobante'}
          </h1>
          <p className="text-muted-foreground text-sm">Completa los datos del envío.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Datos Generales */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Datos Generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tipo de Comprobante *</label>
              <select 
                {...register("tipo", { required: "El tipo es obligatorio" })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Seleccione...</option>
                <option value="Comprobante de Envío">Comprobante de Envío</option>
                <option value="Remito">Remito</option>
              </select>
              {errors.tipo && <span className="text-destructive text-xs mt-1">{errors.tipo.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Número {cargandoNumero && <Loader2 className="inline w-3 h-3 animate-spin text-primary" />} *
              </label>
              <input 
                type="text" 
                {...register("numero_comprobante", { required: "El número es obligatorio" })}
                placeholder="Ej: 0001-00001234"
                disabled={tipoSeleccionado === "Comprobante de Envío" || cargandoNumero}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none disabled:opacity-60 disabled:bg-secondary/50 font-medium"
              />
              {errors.numero_comprobante && <span className="text-destructive text-xs mt-1">{errors.numero_comprobante.message}</span>}
              
              {tipoSeleccionado === "Comprobante de Envío" && (
                <p className="text-[10px] text-muted-foreground mt-1">Número asignado automáticamente.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fecha de Emisión *</label>
              <input 
                type="date" 
                {...register("fecha_emision", { required: "La fecha es obligatoria" })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Origen y Destino */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-primary">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Datos del Remitente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Cliente *</label>
                <select 
                  {...register("cliente_remitente_id", { required: "Seleccione un cliente" })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre_fantasia || c.razon_social || `Cliente ${c.id}`}</option>
                  ))}
                </select>
                {errors.cliente_remitente_id && <span className="text-destructive text-xs mt-1">{errors.cliente_remitente_id.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Domicilio *</label>
                <input 
                  type="text" 
                  {...register("domicilio_remitente", { required: "Campo obligatorio" })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Localidad *</label>
                <select 
                  {...register("localidad_remitente_id", { required: "Seleccione localidad" })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Seleccione...</option>
                  {localidades.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-accent-foreground">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Datos del Destinatario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre / Razón Social *</label>
                <input 
                  type="text" 
                  {...register("nombre_destinatario", { required: "Campo obligatorio" })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Domicilio *</label>
                <input 
                  type="text" 
                  {...register("domicilio_destinatario", { required: "Campo obligatorio" })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Localidad *</label>
                <select 
                  {...register("localidad_destinatario_id", { required: "Seleccione localidad" })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Seleccione...</option>
                  {localidades.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Importes */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Costos y Carga</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cant. Bultos *</label>
              <input 
                type="number" min="1"
                {...register("cantidad_bultos", { required: true, min: 1 })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contra Reembolso ($)</label>
              <input 
                type="number" step="0.01"
                {...register("importe_contra_reembolso")}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Flete Pago ($)</label>
              <input 
                type="number" step="0.01"
                {...register("importe_flete_pago")}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreg round mb-1 text-primary">Flete a Cobrar ($)</label>
              <input 
                type="number" step="0.01"
                {...register("importe_flete_cobro")}
                className="w-full px-3 py-2 rounded-md border border-primary bg-background focus:ring-2 focus:ring-primary outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <label className="block text-sm font-medium text-foreground mb-2">Observaciones</label>
          <textarea 
            {...register("observaciones")}
            rows="3"
            placeholder="Aclaraciones sobre la entrega, horarios, condiciones..."
            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
          ></textarea>
        </div>

        {/* Botones de Accion */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <button 
            type="button" 
            onClick={() => navigate('/comprobantes')}
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
            {isEditing ? 'Guardar Cambios' : 'Generar Comprobante'}
          </button>
        </div>

      </form>
    </div>
  );
}