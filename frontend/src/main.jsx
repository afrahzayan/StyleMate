import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./app/store";
import App from "./App";
import "./index.css";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Redux — makes store available to every component */}
    <Provider store={store}>
      {/* React Router — handles navigation between pages */}
      <BrowserRouter>
        <App />
        {/* Toast notifications — used across auth + wardrobe features */}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);