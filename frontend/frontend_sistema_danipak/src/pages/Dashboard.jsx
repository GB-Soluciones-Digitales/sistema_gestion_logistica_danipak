import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Panel de Control - DaniPak
        </h1>
        <p className="text-text-main mb-8">
          Bienvenido al panel de control de DaniPak. Acá se van a gestionar los comprobantes. Si leíste hasta acá mandá un mensaje. También los Clientes.
        </p>

        <div className="danipak-checklist mb-8">
          <h2 className="text-xl font-semibold mb-2">Fase 1: Frontend y UI/UX (Mobile-First)</h2>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Configurar variables de diseño: Definir los 4 colores clave (Primario de DaniPak, Secundario, Éxito, Peligro para errores)
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Elegir e importar tipografía: Elegir una fuente ultra legible (opciones: Inter, Roboto o Manrope)
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Crear componente Button: Armar el botón base con sus variantes (Primary, Secondary, Outline, Disabled) y estados de carga (spinner interno)
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Crear componente Input: Estandarizar los campos de texto con manejo de errores (bordes rojos y mensajes debajo)
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Implementar mensajes (Toasts): Instalar y configurar una librería (opciones Sonner o React Toastify) para dar feedback visual rápido
              </label>
            </li>
          </ul>
        </div>

        <div className="danipak-checklist mb-8">
          <h2 className="text-xl font-semibold mb-2">Fase 2: Recuperación de Contraseña (Resend + JWT)</h2>
          
          <h3 className="text-lg font-medium mt-4 mb-2">Backend (FastAPI)</h3>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Crear cuenta en Resend, verificar el dominio y agregar la API Key al <code>.env</code>
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Crear función utilitaria para generar un JWT temporal (válido por 15-30 minutos) exclusivo para recuperación
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Actualizar endpoint <code>POST /api/auth/forgot-password</code>: Recibir email, generar token temporal y disparar el correo vía Resend
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Actualizar endpoint <code>POST /api/auth/reset-password</code>: Recibir token y nueva contraseña, verificar validez, hashear con pwdlib y actualizar BD
              </label>
            </li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">Frontend (React)</h3>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Maquetar vista <code>ForgotPassword.jsx</code>: Formulario con input de Email, validación de formato y botón de enviar
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Maquetar vista <code>ResetPassword.jsx</code>: Formulario con los campos "Nueva Contraseña" y "Repetir Contraseña"
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> Agregar lógica en <code>ResetPassword.jsx</code> para extraer el token desde la URL y enviarlo al backend en el POST
              </label>
            </li>
          </ul>
        </div>

        <div className="danipak-checklist mb-8">
          <h2 className="text-xl font-semibold mb-2">Fase 4: Core Logístico</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">Backend (FastAPI)</h3>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> <strong>ABM Clientes:</strong> Desarrollar endpoints CRUD (Crear, Leer, Actualizar, Borrar) para gestionar a los clientes
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> <strong>ABM Comprobantes/Envíos:</strong> Crear endpoints para registrar nuevos comprobantes
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> <strong>Lógica de Cobranza:</strong> Desarrollar endpoint para registrar cobros manuales y actualizar el saldo en la cuenta corriente del cliente
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> <strong>Búsqueda y Filtros:</strong> Agregar parámetros de query en los endpoints de lectura para filtrar envíos por estado o buscar clientes por CUIT/DNI (Armar Triggers y Stored Procedures a nivel bd)
              </label>
            </li>
          </ul>

          <h3 className="text-lg font-medium mt-4 mb-2">Frontend (React)</h3>
          <ul className="list-none pl-0 space-y-2">
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> <strong>Módulo de Cobros:</strong> Armar la interfaz para registrar cobros manuales y reflejar el saldo actualizado del cliente en tiempo real
              </label>
            </li>
            <li>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" /> <strong>Paneles:</strong> Crear los paneles y formularios
              </label>
            </li>
          </ul>
        </div>
        
        <button
          onClick={logout}
          className="bg-red-400 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors mt-4"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}