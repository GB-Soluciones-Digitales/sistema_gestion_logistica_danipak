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
          Bienvenido al panel de control de DaniPak. Aca se van a getionar los comprobantes. Si leiste hasta aca manda un mensaje. Tambien los Clientes.
        </p>

        <div class="danipak-checklist">
          <h2>Fase 1: Frontend y UI/UX (Mobile-First)</h2>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <label>
                <input type="checkbox"> Configurar variables de diseño: Definir los 4 colores clave (Primario de DaniPak, Secundario, Éxito, Peligro para errores) </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Elegir e importar tipografía: Elegir una fuente ultra legible (opciones: Inter, Roboto o Manrope) </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Crear componente Button: Armar el botón base con sus variantes (Primary, Secondary, Outline, Disabled) y estados de carga (spinner interno)</input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Crear componente Input: Estandarizar los campos de texto con manejo de errores (bordes rojos y mensajes debajo) </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Implementar mensajes (Toasts): Instalar y configurar una librería (opciones Sonner o React Toastify) para dar feedback visual rápido </input>
              </label>
            </li>
          </ul>

          <h2>Fase 2: Recuperación de Contraseña (Resend + JWT)</h2>
          
          <h3>Backend (FastAPI)</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <label>
                <input type="checkbox"> Crear cuenta en Resend, verificar el dominio y agregar la API Key al <code>.env</code> </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Crear función utilitaria para generar un JWT temporal (válido por 15-30 minutos) exclusivo para recuperación </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Actualizar endpoint <code>POST /api/auth/forgot-password</code>: Recibir email, generar token temporal y disparar el correo vía Resend </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Actualizar endpoint <code>POST /api/auth/reset-password</code>: Recibir token y nueva contraseña, verificar validez, hashear con pwdlib y actualizar BD </input>
              </label>
            </li>
          </ul>

          <h3>Frontend (React)</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <label>
                <input type="checkbox"> Maquetar vista <code>ForgotPassword.jsx</code>: Formulario con input de Email, validación de formato y botón de enviar </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Maquetar vista <code>ResetPassword.jsx</code>: Formulario con los campos "Nueva Contraseña" y "Repetir Contraseña" </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> Agregar lógica en <code>ResetPassword.jsx</code> para extraer el token desde la URL y enviarlo al backend en el POST </input>
              </label>
            </li>
          </ul>
        </div>

        <div class="danipak-checklist">
          <h2>Fase 4: Core Logístico</h2>

          <h3>Backend (FastAPI)</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <label>
                <input type="checkbox"> <strong>ABM Clientes:</strong> Desarrollar endpoints CRUD (Crear, Leer, Actualizar, Borrar) para gestionar a los clientes </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> <strong>ABM Comprobantes/Envíos:</strong> Crear endpoints para registrar nuevos comprobantes </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> <strong>Lógica de Cobranza:</strong> Desarrollar endpoint para registrar cobros manuales y actualizar el saldo en la cuenta corriente del cliente </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> <strong>Búsqueda y Filtros:</strong> Agregar parámetros de query en los endpoints de lectura para filtrar envíos por estado o buscar clientes por CUIT/DNI (Armar Triggers y Stored Procedured a nivel bd)</input>
              </label>
            </li>
          </ul>

          <h3>Frontend (React)</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li>
              <label>
                <input type="checkbox"> <strong>Módulo de Cobros:</strong> Armar la interfaz para registrar cobros manuales y reflejar el saldo actualizado del cliente en tiempo real </input>
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox"> <strong>Paneles:</strong> Crear los paneles y formularios </input>
              </label>
            </li>
          </ul>
        </div>
        
        <button
          onClick={logout}
          className="bg-red-400 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}