import { useState, useEffect } from 'react';
import { reportesService } from '../../api/reportesService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      try {
        const res = await reportesService.getResumen(fecha);
        setData(res);
      } catch (error) {
        toast.error("Error al cargar los reportes");
        console.error("Error reportes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportes();
  }, [fecha]);

  if (loading && !data) return <div className="p-6 text-center text-muted-foreground">Cargando estadísticas...</div>;
  if (!data) return <div className="p-6 text-center text-muted-foreground">No hay datos disponibles.</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera y Filtro de Fecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reportes y Estadísticas</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Fecha:</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-primary">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Salidas</h2>
          <p className="text-4xl font-bold text-foreground">{data.total_salidas}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm border-t-4 border-t-primary">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Bultos Enviados</h2>
          <p className="text-4xl font-bold text-foreground">{data.bultos_enviados}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Top 5 Clientes - Gráfico de Barras */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Top 5 Clientes (Envíos)</h2>
          <div className="h-72 w-full">
            {data.top_clientes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_clientes} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="nombre" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="envios" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Cantidad de Envíos" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center mt-20">No hay datos para esta fecha</p>
            )}
          </div>
        </div>

        {/* Tráfico por Localidad - Gráfico Circular */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-border">Top Destinos</h2>
          <div className="h-72 w-full">
            {data.top_localidades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.top_localidades}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="envios"
                    nameKey="nombre"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.top_localidades.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center mt-20">No hay datos para esta fecha</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}