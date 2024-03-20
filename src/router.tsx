import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppartementPage from "./Appartement";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppartementPage />}>
        <Route path="apartement" element={<AppartementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
