import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { SidebarProvider } from "./components/ui/sidebar";
import Client from "./pages/Client";

export default function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/client/:id/dashboard" element={<Client />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}