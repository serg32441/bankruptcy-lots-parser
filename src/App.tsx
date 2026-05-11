import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Lots from "./pages/Lots";
import Debtors from "./pages/Debtors";
import Parser from "./pages/Parser";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lots" element={<Lots />} />
        <Route path="/debtors" element={<Debtors />} />
        <Route path="/parser" element={<Parser />} />
      </Routes>
    </Layout>
  );
}
