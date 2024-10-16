import { FC } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequestAccess from "./pages/RequestAccess";

const MainRouter: FC = () => {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="access" element={<RequestAccess />} />
      <Route path="*" element={<Navigate to={"login"} />} />
    </Routes>
  );
};

export default MainRouter;
