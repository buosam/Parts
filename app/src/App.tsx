import { Routes, Route } from "react-router";
import { LangProvider } from "./i18n";
import Home from "./pages/Home";

export default function App() {
  return (
    <LangProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </LangProvider>
  );
}
