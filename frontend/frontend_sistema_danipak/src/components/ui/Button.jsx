// Lauti cucha, esto es el boton base.

export default function Button({ 
  children, // children es simplemente el texto o icono que va adentro del botón.
  variant = 'primary', // Recibe variant para saber que variante va a ser
  className = '', 
  ...props  // El "...props" es para que le pasemos un onClick o un type="submit" y funcione normal. Las propiedades en otras palabras
}) {
  // Esto son los estilos en comun, o sea,  todos los botones van a tener esto.
  const baseStyles = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Estas son las variantes a elegir dependiendo lo especifico que haga
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
    outline: "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}