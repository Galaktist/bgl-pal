export const Router = {
    routes: {},
    currentRoute: null,

    init() {
        globalThis.addEventListener('hashchange', () => this.handleRoute());
        globalThis.addEventListener('load', () => this.handleRoute());
    },

    register(path, handler) {
        this.routes[path] = handler;
    },

    handleRoute() {
        const hash = globalThis.location.hash.slice(1) || '/';
        let routeFound = false;

        for (const [path, handler] of Object.entries(this.routes)) {
            if (path === hash || this.matchRoute(path, hash)) {
                this.currentRoute = hash;
                this.updateActiveNav(hash);
                handler(this.extractParams(path, hash));
                routeFound = true;
                break;
            }
        }

        if (!routeFound) {
            this.currentRoute = '/';
            this.routes['/']();
        }
    },

    matchRoute(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) return false;

        return patternParts.every((part, i) => {
            return part.startsWith(':')?? (part === pathParts[i]);
        });
    },

    extractParams(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        const params = {};

        // patternParts.forEach((part, i) => {
        //     console.log('part:', part, 'logic:',part.startsWith(':'), 'i:', i);
        //     if (part.startsWith(':')) {
        //         params[part.slice(1)] = pathParts[i];
        //     }
        // });

        //forEach (part, i) order for for-of becomes (i, part)

        for(const [idx, part] of patternParts.entries()) {
            
            if (part.startsWith(':')) {
                params[part.slice(1)] = pathParts[idx];
            }
        }

        return params;
    },

    updateActiveNav(path) {
        const linkers = document.querySelectorAll('.nav-links a');

        for(const link of linkers) {
            link.classList.remove('active');
        }

        const activeLink = document.querySelector(`.nav-links a[href="#${path}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    },

    navigate(path) {
        globalThis.location.hash = path;
    }
};
