import applicationRoutes from "../smscr/applications/application.route.js";
import authRoutes from "../smscr/auth/auth.route.js";

const routers = app => {
  app.use("/api/v1/application", applicationRoutes);
  app.use("/api/v1/auth", authRoutes);
};

export default routers;
