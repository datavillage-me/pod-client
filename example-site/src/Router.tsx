import { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import LoginCallback from "./pages/LoginCallback";
import RequestAccess from "./pages/RequestAccess";

const MainRouter: FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="login/callback" element={<LoginCallback />} />
      <Route path="access" element={<RequestAccess />} />
      <Route path="*" element={<Navigate to={"login"} />} />
    </Routes>
  );
};

export default MainRouter;
