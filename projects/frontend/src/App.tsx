import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { SidebarProvider } from "./components/ui/sidebar";

export default function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}