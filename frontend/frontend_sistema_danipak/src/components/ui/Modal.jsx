import { X } from 'lucide-react';

// Cucha esta es una ventana modal para reutilizar
// Adentro le metemos el formulario o texto, cualquier cosa, para eso es el children.

export default function Modal({ isOpen, onClose, title, children }) {
  // Si no esta abierto, no renderizamos absolutamente nada en la pantalla
  if (!isOpen) return null;

  return (
    // El fondo oscuro que tapa el resto de la app y tiene un blureado
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-lg rounded-lg shadow-lg border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-display font-semibold text-foreground">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Aca va lo que le pasemos */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}