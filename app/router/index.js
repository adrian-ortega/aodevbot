const DEFAULT_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'];
const DEFAULT_ROUTE = {
  path: '',
  methods: [DEFAULT_METHODS[0]],
  middleware: [],
  handler: () => {}
};

const router = (app) => {
  const sanitizedRoutes = require('./routes.js').map(r => ({ ...DEFAULT_ROUTE, ...r }));
  const registeredMethods = [...DEFAULT_METHODS].map(m => m.toLowerCase());
  sanitizedRoutes.forEach(route => {
    const { path, middleware, handler, methods } = route;
    const sanitizedMethods = methods.map(m => m.toLowerCase()).filter(m => registeredMethods.includes(m));
    sanitizedMethods.forEach(method => {
      app[method](path, middleware, handler);
    });
  });

  return app;
};

module.exports = router;
