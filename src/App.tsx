// import BottomBar from "./components/BottomBar";
import NavigationBar from "./components/NavigationBar";
import MonacoEditor from "./components/MonacoEditor";
import { AppProvider } from "./contexts/AppProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EditorPage from "./pages/EditorPage";
import DocsPage from "./pages/DocsPage";
import "./style/theme.css";
import "./App.css";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
export default App;
