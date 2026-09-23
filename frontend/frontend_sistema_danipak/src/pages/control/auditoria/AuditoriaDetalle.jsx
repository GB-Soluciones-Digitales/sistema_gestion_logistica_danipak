import Modal from '../../../components/ui/Modal';
import {parseDetalles, humanize, formatValue, formatFecha, buildRows, accionStyles } from './AuditoriaDetalleUtils';

export function AccionBadge({ accion }) {
    return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${accionStyles(accion)}`}>
            {accion || '—'}
        </span>
    );
}

export default function AuditoriaDetalleModal({ item, onClose }) {
    if (!item) return null;
    const { mode, rows } = buildRows(item.detalles_cambio);
    const crudo = parseDetalles(item.detalles_cambio);

    return (
        <Modal isOpen={!!item} onClose={onClose} title={`Auditoría #${item.id}`} maxWidth="max-w-2xl">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Acción: </span><AccionBadge accion={item.accion} /></div>
                    <div><span className="text-muted-foreground">Fecha: </span>{formatFecha(item.fecha)}</div>
                    <div><span className="text-muted-foreground">Tabla: </span>{item.tabla_afectada}</div>
                    <div><span className="text-muted-foreground">Registro: </span>#{item.registro_id}</div>
                    <div><span className="text-muted-foreground">Usuario: </span>{item.usuario_id ?? '—'}</div>
                </div>

                {rows.length > 0 ? (
                    <div className="border border-input rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-muted-foreground text-xs uppercase">
                                {mode === 'diff' ? (
                                    <tr>
                                        <th className="text-left px-3 py-2">Campo</th>
                                        <th className="text-left px-3 py-2">Antes</th>
                                        <th className="text-left px-3 py-2">Después</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="text-left px-3 py-2">Campo</th>
                                        <th className="text-left px-3 py-2">Valor</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-input">
                                {rows.map((r) =>
                                    mode === 'diff' ? (
                                        <tr key={r.campo} className={r.changed ? 'bg-amber-50' : ''}>
                                            <td className="px-3 py-2 font-medium">{humanize(r.campo)}</td>
                                            <td className={`px-3 py-2 wrap-break-word ${r.changed ? 'text-red-700 line-through' : 'text-muted-foreground'}`}>
                                                {formatValue(r.antes)}
                                            </td>
                                            <td className={`px-3 py-2 wrap-break-word ${r.changed ? 'text-green-700 font-medium' : 'text-muted-foreground'}`}>
                                                {formatValue(r.despues)}
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={r.campo}>
                                            <td className="px-3 py-2 font-medium w-1/3">{humanize(r.campo)}</td>
                                            <td className="px-3 py-2 wrap-break-word">{formatValue(r.valor)}</td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Esta auditoría no tiene detalles registrados.</p>
                )}

                {crudo !== null && (
                    <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">Ver JSON crudo</summary>
                        <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto max-h-64 whitespace-pre-wrap">
                            {typeof crudo === 'object' ? JSON.stringify(crudo, null, 2) : crudo}
                        </pre>
                    </details>
                )}
            </div>
        </Modal>
    );
}