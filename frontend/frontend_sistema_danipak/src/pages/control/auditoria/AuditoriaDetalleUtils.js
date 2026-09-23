export const parseDetalles = (d) => {
    if (d === null || d === undefined) return null;
    if (typeof d === 'string') {
        try { return JSON.parse(d); } catch { return d; }
    }
    return d;
};

export const humanize = (k) =>
    String(k).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const formatValue = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Sí' : 'No';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
};

export const formatFecha = (f) =>
    f ? new Date(f).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const buildRows = (raw) => {
    const d = parseDetalles(raw);
    if (!d || typeof d !== 'object') return { mode: 'snapshot', rows: [] };

    if (d.antes || d.despues) {
        const antes = d.antes || {};
        const despues = d.despues || {};
        const keys = [...new Set([...Object.keys(antes), ...Object.keys(despues)])];
        const rows = keys.map((k) => ({
            campo: k, antes: antes[k], despues: despues[k],
            changed: JSON.stringify(antes[k]) !== JSON.stringify(despues[k]),
        }));
        return { mode: 'diff', rows };
    }

    const values = Object.values(d);
    const isFieldDiff = values.length > 0 && values.every(
        (v) => v && typeof v === 'object' && ('antes' in v || 'despues' in v)
    );
    if (isFieldDiff) {
        const rows = Object.entries(d).map(([k, v]) => ({
            campo: k, antes: v.antes, despues: v.despues,
            changed: JSON.stringify(v.antes) !== JSON.stringify(v.despues),
        }));
        return { mode: 'diff', rows };
    }

    return { mode: 'snapshot', rows: Object.entries(d).map(([k, v]) => ({ campo: k, valor: v })) };
};

export const resumenDetalles = (raw) => {
    const { mode, rows } = buildRows(raw);
    if (rows.length === 0) return 'Sin detalles';
    if (mode === 'diff') {
        const cambios = rows.filter((r) => r.changed);
        if (cambios.length === 0) return 'Sin cambios';
        const nombres = cambios.slice(0, 3).map((r) => humanize(r.campo).toLowerCase()).join(', ');
        const extra = cambios.length > 3 ? '…' : '';
        return `${cambios.length} ${cambios.length === 1 ? 'campo modificado' : 'campos modificados'}: ${nombres}${extra}`;
    }
    return `Registro completo (${rows.length} campos)`;
};

export const accionStyles = (accion = '') => {
    const a = accion.toLowerCase();
    if (/(crea|insert|alta|create)/.test(a)) return 'bg-green-100 text-green-700';
    if (/(elimin|delete|baja)/.test(a)) return 'bg-red-100 text-red-700';
    if (/(actualiz|update|modific)/.test(a)) return 'bg-amber-100 text-amber-700';
    return 'bg-muted text-muted-foreground';
};