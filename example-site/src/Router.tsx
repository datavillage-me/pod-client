import { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Callback from "./pages/Callback";

const MainRouter: FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="callback" element={<Callback />} />
      <Route path="*" element={<Navigate to={"login"} />} />
    </Routes>
  );
};

export default MainRouter;
