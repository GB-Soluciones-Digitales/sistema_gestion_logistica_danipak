import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { ArrowLeft, Save, Loader2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { comprobantesService } from '../../../api/comprobantesService';
import { localidadService } from '../../../api/localidadService';
import { clientesServices } from '../../../api/clientesServices';
import { facturaService } from '../../../api/facturaService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ClienteAutocomplete from '../../../components/ui/ClienteAutocomplete';
import { generarPdfLocal } from '../../../utils/pdfGenerator';

export default function ComprobanteForm() {
  const { id } = useParams(); 
  const isEditing = Boolean(id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [localidades, setLocalidades] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [cargandoNumero, setCargandoNumero] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const getFechaLocal = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      estado: 'Emitido',
      tipo: '',
      cantidad_bultos: 1,
      fecha_emision: getFechaLocal(),
      nombre_remitente: '',
      cliente_remitente_id: null,
      factura_cliente_id: null,
      factura_cliente_nombre: ''
    }
  });

  const tipoSeleccionado = useWatch({
    control,
    name: "tipo"
  });

  const esFactura = tipoSeleccionado === "Factura";

  const facturaClienteId = useWatch({
    control,
    name: "factura_cliente_id"
  });
  const clienteFactura = clientes.find(c => c.id === facturaClienteId);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [resLocalidades, resClientes] = await Promise.all([
          localidadService.getAll(1, 1000),
          clientesServices.getAll(1, 1000)
        ]);

        setLocalidades((resLocalidades.items || []).filter(l => l.estado === true));
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
        console.error("Error al cargar los datos", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, isEditing, reset]);

  const cargarProximoNumero = useCallback(async (tipo) => {
    if (tipo === "Comprobante de Envío") {
      if (!navigator.onLine) {
        toast.info("Sin conexión: Ingrese el número correlativo manualmente.");
        setValue("numero_comprobante", "");
        return;
      }
      setCargandoNumero(true);
      try {
        const res = await comprobantesService.getUltimoNumero(); 
        const partes = res.ultimo_numero.split('-');
        if (partes.length === 2) {
          const siguienteNumero = parseInt(partes[1], 10) + 1;
          const nuevoCorrelativo = String(siguienteNumero).padStart(8, '0');
          setValue("numero_comprobante", `${partes[0]}-${nuevoCorrelativo}`);
        }
      } catch (error) {
        toast.error("Error al obtener el número correlativo");
        console.error("Error al obtener el número correlativo", error);
      } finally {
        setCargandoNumero(false);
      }
    } else if (tipo === "Remito" || tipo === "Factura") {
      setValue("numero_comprobante", "");
    }
  }, [setValue]);

  useEffect(() => {
    if (!isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      cargarProximoNumero(tipoSeleccionado);
    }
  }, [tipoSeleccionado, isEditing, cargarProximoNumero]);

  const onSubmitFactura = async (data) => {
    if (!data.factura_cliente_id) {
      toast.error("Seleccione un cliente registrado para la factura.");
      return;
    }

    try {
      await facturaService.createFactura({
        cliente_id: parseInt(data.factura_cliente_id),
        numero_factura: data.numero_comprobante,
        mes_correspondiente: data.mes_correspondiente,
        fecha: data.fecha_emision,
        importe_total: parseFloat(data.importe_total),
        observaciones: data.observaciones || null,
      });

      toast.success(clienteFactura?.tiene_cuenta_corriente
        ? "Factura registrada y deuda actualizada en la cuenta corriente"
        : "Factura registrada como cobrada");

      queryClient.invalidateQueries({ queryKey: ['comprobantes'] });
      queryClient.invalidateQueries({ queryKey: ['cuenta-resumen'] });
      queryClient.invalidateQueries({ queryKey: ['cuenta-movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['cuentas-corrientes'] });
      navigate('/comprobantes');
    } catch (error) {
      console.error("Error al guardar la factura:", error);
      toast.error(error.response?.data?.detail || error.message || "Ocurrió un error al guardar la factura");
    }
  };

  const onSubmit = async (data, shouldPrint = false) => {
    if (esFactura && !isEditing) {
      return onSubmitFactura(data);
    }

    if (!data.nombre_remitente || data.nombre_remitente.trim() === '') {
      toast.error("Debe ingresar al menos el nombre del remitente.");
      return;
    }

    try {
      const payload = {
        ...data,
        cliente_remitente_id: data.cliente_remitente_id ? parseInt(data.cliente_remitente_id) : null,
        localidad_remitente_id: parseInt(data.localidad_remitente_id),
        localidad_destinatario_id: parseInt(data.localidad_destinatario_id),
        cantidad_bultos: parseInt(data.cantidad_bultos),
        importe_contra_reembolso: data.importe_contra_reembolso ? parseFloat(data.importe_contra_reembolso) : 0,
        importe_flete_pago: data.importe_flete_pago ? parseFloat(data.importe_flete_pago) : 0,
        importe_flete_cobro: data.importe_flete_cobro ? parseFloat(data.importe_flete_cobro) : 0,
      };

      if (isEditing) {
        await comprobantesService.updateEstado(id, payload);
        toast.success("Comprobante actualizado exitosamente");
        queryClient.invalidateQueries({ queryKey: ['comprobantes'] });
        navigate('/comprobantes');
      } else {
        const nuevoComprobante = await comprobantesService.createComprobante(payload);
        toast.success("Comprobante creado exitosamente");
        
        if (shouldPrint && nuevoComprobante.id) {
          try {
            const locRemitenteObj = localidades.find(l => l.id === payload.localidad_remitente_id);
            const locDestObj = localidades.find(l => l.id === payload.localidad_destinatario_id);

            const datosParaPdf = {
                ...nuevoComprobante,
                cliente: { razon_social: data.nombre_remitente },
                localidad_remitente_rel: { nombre: locRemitenteObj ? locRemitenteObj.nombre : '' },
                localidad_destinatario_rel: { nombre: locDestObj ? locDestObj.nombre : '' }
            };

            const blob = await generarPdfLocal(datosParaPdf, null, true);
            const url = window.URL.createObjectURL(blob);

            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            setTimeout(() => window.URL.revokeObjectURL(url), 30000);
          } catch (pdfError) {
            console.error("Error al generar PDF automático", pdfError);
            toast.error("Error en la impresión directa.");
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['comprobantes'] });
        reset({
          estado: 'Emitido',
          tipo: data.tipo,
          cantidad_bultos: 1,
          fecha_emision: getFechaLocal(),
          nombre_remitente: '',
          cliente_remitente_id: null,
          factura_cliente_id: null,
          factura_cliente_nombre: '',
          domicilio_remitente: '',
          localidad_remitente_id: '',
          nombre_destinatario: '',
          domicilio_destinatario: '',
          localidad_destinatario_id: '',
          importe_contra_reembolso: '',
          importe_flete_pago: '',
          importe_flete_cobro: '',
          observaciones: '',
          numero_comprobante: '' 
        });
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        cargarProximoNumero(data.tipo);
      }
      
    } catch (error) {
      console.error("Error completo al guardar:", error);
      toast.error(error.response?.data?.detail || error.message || "Ocurrió un error al guardar");
    }
  };

  if (loadingData) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  return (
    <div className="space-y-6 pb-10">
      
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
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="text-lg font-semibold">Datos Generales</h2>
            {isOffline && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Modo Offline</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tipo de Comprobante *</label>
              <select 
                {...register("tipo", { required: "El tipo es obligatorio" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="">Seleccione...</option>
                <option value="Comprobante de Envío">Comprobante de Envío</option>
                <option value="Remito">Remito</option>
                {!isEditing && <option value="Factura">Factura</option>}
              </select>
              {errors.tipo && <span className="text-destructive text-xs mt-1">{errors.tipo.message}</span>}
            </div>
            
            <div>
              <Input 
                label={<>Número {cargandoNumero && <Loader2 className="inline w-3 h-3 animate-spin text-primary" />} *</>}
                error={errors.numero_comprobante?.message}
                placeholder="Ej: 0001-00001234"
                disabled={cargandoNumero}
                className="font-medium disabled:bg-secondary/50"
                {...register("numero_comprobante", { required: "El número es obligatorio" })}
              />
              {esFactura && (
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Ingrese el número de la factura.</p>
              )}
              {tipoSeleccionado === "Comprobante de Envío" && (
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  {isOffline ? 'Sin conexión: Ingrese el número manualmente.' : 'Sugerido automáticamente. Puede editarlo si difiere del talonario.'}
                </p>
              )}
            </div>
            
            <Input 
              type="date"
              label="Fecha de Emisión *"
              error={errors.fecha_emision?.message}
              {...register("fecha_emision", { required: "La fecha es obligatoria" })}
            />
          </div>
        </div>

        {esFactura && (
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-primary">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Datos de la Factura</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1">Cliente *</label>
                <Controller
                  name="factura_cliente_nombre"
                  control={control}
                  rules={{ required: "El cliente es obligatorio" }}
                  render={({ field }) => (
                    <ClienteAutocomplete
                      clientes={clientes}
                      value={field.value || ''}
                      onChange={(texto) => {
                        field.onChange(texto);
                        setValue("factura_cliente_id", null);
                      }}
                      onSelect={(cliente) => {
                        field.onChange(cliente.razon_social);
                        setValue("factura_cliente_id", cliente.id);
                      }}
                      placeholder="Buscar cliente registrado..."
                    />
                  )}
                />
                {errors.factura_cliente_nombre && <span className="text-destructive text-xs mt-1 block">{errors.factura_cliente_nombre.message}</span>}
                {clienteFactura && (
                  <p className={`text-xs mt-2 font-medium ${clienteFactura.tiene_cuenta_corriente ? 'text-red-600' : 'text-green-700'}`}>
                    {clienteFactura.tiene_cuenta_corriente
                      ? 'Cliente con Cuenta Corriente: la factura se suma a su deuda.'
                      : 'Cliente sin Cuenta Corriente: la factura se registra como cobrada en el momento.'}
                  </p>
                )}
              </div>
              <Input
                label="Mes Correspondiente *"
                placeholder="Ej: Septiembre 2026"
                error={errors.mes_correspondiente?.message}
                {...register("mes_correspondiente", { required: "El mes es obligatorio" })}
              />
              <Input
                type="number"
                step="0.01"
                label="Importe Total ($) *"
                placeholder="0.00"
                error={errors.importe_total?.message}
                {...register("importe_total", { required: "El importe es obligatorio", min: { value: 0.01, message: "Debe ser mayor a 0" } })}
              />
            </div>
          </div>
        )}

        {/* Origen y Destino */}
        {!esFactura && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-primary">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Datos del Remitente</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre Remitente *</label>
                <Controller
                  name="nombre_remitente"
                  control={control}
                  rules={{ required: "El nombre es obligatorio" }}
                  render={({ field }) => (
                    <ClienteAutocomplete
                      clientes={clientes}
                      value={field.value || ''}
                      onChange={(texto) => {
                        field.onChange(texto);
                        setValue("cliente_remitente_id", null, { shouldValidate: true });
                      }}
                      onSelect={(cliente) => {
                        field.onChange(cliente.razon_social);
                        setValue("cliente_remitente_id", cliente.id, { shouldValidate: true });
                        setValue("domicilio_remitente", cliente.direccion || '');
                        if (cliente.localidad_id) {
                          setValue("localidad_remitente_id", cliente.localidad_id, { shouldValidate: true });
                        }
                      }}
                      placeholder="Buscar cliente registrado..."
                    />
                  )}
                />
                {errors.nombre_remitente && <span className="text-destructive text-xs mt-1 block">{errors.nombre_remitente.message}</span>}
              </div>
              <Input 
                label="Domicilio"
                error={errors.domicilio_remitente?.message}
                {...register("domicilio_remitente")}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Localidad *</label>
                <select 
                  {...register("localidad_remitente_id", { required: "Seleccione localidad" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccione...</option>
                  {localidades.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
                {errors.localidad_remitente_id && <span className="text-destructive text-xs mt-1">{errors.localidad_remitente_id.message}</span>}
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-accent-foreground">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Datos del Destinatario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre / Razón Social *</label>
                <Controller
                  name="nombre_destinatario"
                  control={control}
                  rules={{ required: "Campo obligatorio" }}
                  render={({ field }) => (
                    <ClienteAutocomplete
                      clientes={clientes}
                      value={field.value || ''}
                      onChange={field.onChange}
                      onSelect={(cliente) => {
                        field.onChange(cliente.razon_social || cliente.nombre_fantasia);
                        setValue("domicilio_destinatario", cliente.direccion || cliente.direccion_fiscal || '');
                        if (cliente.localidad_id) {
                          setValue("localidad_destinatario_id", cliente.localidad_id, { shouldValidate: true });
                        }
                      }}
                      placeholder="Buscar en agenda o escribir..."
                    />
                  )}
                />
                {errors.nombre_destinatario && <span className="text-destructive text-xs mt-1">{errors.nombre_destinatario.message}</span>}
              </div>
              <Input 
                label="Domicilio"
                error={errors.domicilio_destinatario?.message}
                {...register("domicilio_destinatario")}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Localidad *</label>
                <select 
                  {...register("localidad_destinatario_id", { required: "Seleccione localidad" })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccione...</option>
                  {localidades.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
                {errors.localidad_destinatario_id && <span className="text-destructive text-xs mt-1">{errors.localidad_destinatario_id.message}</span>}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Importes */}
        {!esFactura && (
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Costos y Carga</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input 
              type="number"
              min="1"
              label="Cant. Bultos *"
              className="font-bold text-lg"
              {...register("cantidad_bultos", { required: true, min: 1 })}
            />
            <Input 
              type="number"
              step="0.01"
              label="Contra Reembolso ($)"
              {...register("importe_contra_reembolso")}
            />
            <Input 
              type="number"
              step="0.01"
              label="Flete Pago ($)"
              {...register("importe_flete_pago")}
            />
            <Input 
              type="number"
              step="0.01"
              label="Flete a Cobrar ($)"
              className="font-bold border-primary"
              {...register("importe_flete_cobro")}
            />
          </div>
        </div>
        )}

        {/* Observaciones */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <label className="block text-sm font-medium text-foreground mb-2">Observaciones</label>
          <textarea 
            {...register("observaciones")}
            rows="3"
            placeholder="Aclaraciones sobre la entrega, horarios, condiciones..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          ></textarea>
        </div>

        {/* Botones de Accion */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => navigate('/comprobantes')}>
            Cancelar
          </Button>

          {esFactura ? (
            <Button type="button" onClick={handleSubmit((d) => onSubmit(d, false))} disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Registrar Factura
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={handleSubmit((d) => onSubmit(d, false))} disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isEditing ? 'Solo Guardar Cambios' : 'Solo Guardar'}
              </Button>
              <Button type="button" onClick={handleSubmit((d) => onSubmit(d, true))} disabled={isSubmitting} className="flex items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
                {isEditing ? 'Guardar e Imprimir' : 'Guardar e Imprimir'}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}