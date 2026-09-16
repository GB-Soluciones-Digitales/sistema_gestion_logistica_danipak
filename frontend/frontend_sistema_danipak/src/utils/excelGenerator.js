import * as XLSX from 'xlsx';
import { toast } from 'sonner';

/**
 * Genera y descarga un archivo Excel a partir de un array de objetos JSON.
 * 
 * @param {Array} datosFormateados - Array de objetos con las columnas ya mapeadas.
 * @param {String} nombreArchivo - Prefijo del nombre del archivo (ej: 'Reporte_Clientes').
 * @param {String} nombreHoja - Nombre de la hoja dentro del archivo Excel (ej: 'Datos').
 */
export const exportarAExcel = (datosFormateados, nombreArchivo = 'Reporte', nombreHoja = 'Datos') => {
    if (!datosFormateados || datosFormateados.length === 0) {
        toast.warning("No hay datos para exportar con estos filtros.");
        return false;
    }

    try {
        // 1. Convertimos el JSON a una hoja de cálculo
        const hoja = XLSX.utils.json_to_sheet(datosFormateados);
        
        // 2. Creamos un libro de trabajo y le adjuntamos la hoja
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
        
        // 3. Generamos el archivo con una marca de tiempo para que no se sobreescriban
        const timestamp = new Date().getTime();
        XLSX.writeFile(libro, `${nombreArchivo}_${timestamp}.xlsx`);
        
        toast.success("Excel descargado correctamente");
        return true;
    } catch (error) {
        console.error("Error exportando a Excel", error);
        toast.error("Ocurrió un error al generar el Excel.");
        return false;
    }
};