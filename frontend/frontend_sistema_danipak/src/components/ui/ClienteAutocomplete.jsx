import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function ClienteAutocomplete({ 
  clientes = [], 
  value = "", 
  onChange, 
  onSelect, 
  placeholder = "Escribir nombre o buscar..." 
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    onChange(text); // Actualiza el form con texto libre

    if (text.length >= 2) {
      const textLower = text.toLowerCase();
      const filtrados = clientes.filter(cli => 
        (cli.razon_social && cli.razon_social.toLowerCase().includes(textLower)) ||
        (cli.nombre_fantasia && cli.nombre_fantasia.toLowerCase().includes(textLower)) ||
        (cli.cuit_dni && cli.cuit_dni.includes(textLower))
      );
      setSuggestions(filtrados);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleItemClick = (cliente) => {
    const nombre = cliente.razon_social || cliente.nombre_fantasia;
    onChange(nombre); 
    setShowDropdown(false);
    if (onSelect) onSelect(cliente);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input 
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          autoComplete="off"
        />
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto animate-in fade-in-80">
          {suggestions.map(cli => (
            <li 
              key={cli.id}
              onClick={() => handleItemClick(cli)}
              className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex flex-col border-b border-border last:border-0"
            >
              <span className="font-medium text-sm">{cli.razon_social || cli.nombre_fantasia}</span>
              <span className="text-xs text-muted-foreground">CUIT/DNI: {cli.cuit_dni || 'N/A'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}