import { type RouteConfig, 
    route,
    index,
    layout
} from "@react-router/dev/routes";

export default [
    layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("login","routes/login.tsx"),
    route("admin","routes/admin.tsx"),
    ]),
] satisfies RouteConfig;
