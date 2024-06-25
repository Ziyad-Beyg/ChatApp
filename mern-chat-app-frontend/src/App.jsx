import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage";
import ChatsPage from "./pages/ChatsPage";
import ProtectedRoute from "./components/Authentication/ProtectedRoute";
import NotFound from "./components/Miscellaneous/NotFound";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={true} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
