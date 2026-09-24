import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { CuesPage } from "./pages/CuesPage";
import { ExecutionPage } from "./pages/ExecutionPage";
import { FixturesPage } from "./pages/FixturesPage";
import { PreviewPage } from "./pages/PreviewPage";
import { TimelinePage } from "./pages/TimelinePage";
import { StatusBadge } from "./components/common/StatusBadge";
import "./styles.css";

function pageFor(route: string) {
  if (route === "/fixtures") return <FixturesPage />;
  if (route === "/cues") return <CuesPage />;
  if (route === "/timeline") return <TimelinePage />;
  if (route === "/execution") return <ExecutionPage />;
  if (route === "/preview") return <PreviewPage />;
  return <FixturesPage />;
}

function readRoute() {
  const route = window.location.hash.replace(/^#/, "");
  return routes.some((item) => item.route === route) ? route : routes[0].route;
}

function App() {
  const [active, setActive] = useState(readRoute());

  useEffect(() => {
    const onHashChange = () => setActive(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const current = routes.find((route) => route.route === active) ?? routes[0];

  return (
    <div className="shell">
      <aside>
        <div className="brand"><span>舞台灯光</span><strong>执行单工作台</strong></div>
        <p className="storage-note"><StatusBadge value="LOCAL_DATA" /></p>
        <nav>{routes.map((route) => (
          <a key={route.route} href={`#${route.route}`} className={active === route.route ? "active" : ""}>{route.name}</a>
        ))}</nav>
      </aside>
      {pageFor(current.route)}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
