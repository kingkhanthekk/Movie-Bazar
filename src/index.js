import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
import App from "./App";
import RatingStar from "./RatingStar";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <RatingStar />
    <RatingStar maxRating={"sss"} />
  </React.StrictMode>
);
