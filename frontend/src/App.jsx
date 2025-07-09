import "./global.css";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          {/* <Route path="signup" element={<Signup />} /> */}
          {/* <Route path="verification" element={<Verification />} /> */}
        </Route>
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="/settings" element={<Settings />} /> */}
      </Routes>
    </>
  );
}

export default App;
