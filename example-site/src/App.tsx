import "./App.css";
import { BrowserRouter } from "react-router-dom";
import MainRouter from "./Router";

function App() {
  return (
    <BrowserRouter>
      <MainRouter />
    </BrowserRouter>
  );
}

export default App;
