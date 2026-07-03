import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "./app/store";
import App from "./App";
import "./index.css";


const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Redux — makes store available to every component */}
    <Provider store={store}>
      {/* Google OAuth — needed for the Google login button to work */}
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {/* React Router — handles navigation between pages */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);