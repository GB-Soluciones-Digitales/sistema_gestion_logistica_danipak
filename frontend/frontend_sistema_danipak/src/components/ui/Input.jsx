import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Si le pasamos un texto para el label, lo dibuja */}
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        className={`
          flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground
          placeholder:text-muted-foreground 
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors
          ${error ? 'border-destructive focus:ring-destructive' : 'border-input'} 
          ${className}
        `}
        {...props}
      />
      
      {/* Si hay un error, muestra el mensajito en rojo abajo del input */}
      {error && (
        <span className="text-xs font-medium text-destructive">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;