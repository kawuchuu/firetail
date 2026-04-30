export function getResource(p) {
    if (p.startsWith('\\\\')) {
        const without = p.slice(2).replace(/\\/g, '/');
        return `media://${without.split('/').map(encodeURIComponent).join('/')}`;
    }
    const forward = p.replace(/\\/g, '/');
    const [drive, ...rest] = forward.split('/');
    return `media:/${drive}/${rest.map(encodeURIComponent).join('/')}`;
}