export const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return '-';
    }
    
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(date);
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};