import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import PostDetail from "@/pages/PostDetail";
import Archives from "@/pages/Archives";
import Search from "@/pages/Search";
import About from "@/pages/About";
import Thoughts from "@/pages/Thoughts";
import NotFound from "@/pages/NotFound";

import "@/styles/hljs-theme.css";
import "@/styles/theme.css";
import "@/styles/base.css";
import "@/styles/layout.css";
import "@/styles/markdown.css";
import "@/styles/components.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="posts" element={<Home />} />
          <Route path="posts/:slug" element={<PostDetail />} />
          <Route path="archives" element={<Archives />} />
          <Route path="search" element={<Search />} />
          <Route path="about" element={<About />} />
          <Route path="thoughts" element={<Thoughts />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
