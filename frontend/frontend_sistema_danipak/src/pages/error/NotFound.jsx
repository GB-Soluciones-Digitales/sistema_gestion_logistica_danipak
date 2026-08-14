import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-4">
        <h1 className="text-9xl font-display font-extrabold text-primary">
          404
        </h1>
        <h2 className="text-3xl font-display font-bold text-foreground">
          Página no encontrada
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Parece que te desviaste de la ruta. El comprobante o la página que estás buscando no existe o fue movida.
        </p>
      </div>

      <div className="mt-8">
        <Link 
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}