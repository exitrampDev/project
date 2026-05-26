// AppWrapper.js
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { authState } from "./recoil/ctaState";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";

const AppWrapper = () => {
  const [loading, setLoading] = useState(true);
  const setAuth = useSetRecoilState(authState);

  useEffect(() => {
    let user = localStorage.getItem("user");
    let token = localStorage.getItem("tokenLocalStorage");
    user = JSON.parse(user);
    setAuth({ access_token: token, user });
    setLoading(false);
  }, []);

  if (loading) return <div>Loading app...</div>;

  return <HelmetProvider><App /></HelmetProvider>;
};

export default AppWrapper;
