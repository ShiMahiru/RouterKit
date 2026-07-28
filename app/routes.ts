import {
  type RouteConfig,
  route,
  layout,
  index,
} from "@react-router/dev/routes";

export default [
  layout("./layout.tsx", [
    index("./routes/home.tsx"),
    route("posts", "./routes/home.tsx"),
    route("posts/:slug", "./routes/post-detail.tsx"),
    route("archives", "./routes/archives.tsx"),
    route("search", "./routes/search.tsx"),
    route("*", "./routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;
