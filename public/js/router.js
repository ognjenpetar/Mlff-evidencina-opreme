// Simple SPA Router for Equipment Tracking App
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, params] = hash.split('?');
        const queryParams = this.parseQuery(params);

        // Route patterns:
        // / or empty - Dashboard
        // /location/:id - Location detail
        // /equipment/:id - Equipment detail
        // /report/location/:id - Location report view
        // /report/equipment/:id - Equipment report view
        // Legacy: #eq=:id - Equipment detail (for old QR codes)

        // Handle legacy QR code format
        if (hash.startsWith('eq=')) {
            const id = hash.split('=')[1];
            this.navigate(`/equipment/${id}`);
            return;
        }

        if (path === '/' || path === '') {
            this.routes['dashboard']?.();
        } else if (path.startsWith('/location/')) {
            const id = path.split('/')[2];
            this.routes['location']?.(id, queryParams);
        } else if (path.startsWith('/equipment/')) {
            const id = path.split('/')[2];
            this.routes['equipment']?.(id, queryParams);
        } else if (path.startsWith('/report/location/')) {
            const id = path.split('/')[3];
            this.routes['locationReport']?.(id, queryParams);
        } else if (path.startsWith('/report/equipment/')) {
            const id = path.split('/')[3];
            this.routes['equipmentReport']?.(id, queryParams);
        } else {
            // Unknown route - redirect to dashboard
            this.navigate('/');
        }

        this.currentRoute = path;
    }

    parseQuery(queryString) {
        if (!queryString) return {};
        return Object.fromEntries(
            queryString.split('&').map(pair => {
                const [key, value] = pair.split('=');
                return [decodeURIComponent(key), decodeURIComponent(value)];
            })
        );
    }

    navigate(path) {
        window.location.hash = path;
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Global router instance
const router = new Router();
