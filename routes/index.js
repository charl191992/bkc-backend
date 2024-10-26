import applicationRoutes from "../smscr/applications/application.route.js";

const routers = app => {
  app.use("/api/v1/application", applicationRoutes);
};

export default routers;
