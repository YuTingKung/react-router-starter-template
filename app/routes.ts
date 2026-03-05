import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("invoice", "routes/invoice.tsx"),
  route("api/invoice-analyze", "routes/api.invoice-analyze.tsx"),
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
