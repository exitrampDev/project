import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/footerLogo.png";

const NotFound = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src={logo} alt="Logo"  style={styles.logo}/>
        <h1 style={styles.code}>404</h1>
        <h2 style={styles.title}>Oops! Page Not Found</h2>
        <p style={styles.text}>
          The page you're looking for doesn’t exist or has been moved.
        </p>

        <Link to="/" style={styles.button}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#002f68",
    fontFamily: "Arial, sans-serif",
  },
  logo: {
    width: "80%",
    marginBottom: "20px",
  },
  card: {
    textAlign: "center",
    background: "#fff",
    padding: "50px 40px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    maxWidth: "400px",
    width: "90%",
  },
  code: {
    fontSize: "80px",
    margin: "0",
    color: "#002f68",
  },
  title: {
    margin: "10px 0",
    fontSize: "24px",
    color: "#333",
  },
  text: {
    color: "#777",
    fontSize: "14px",
    marginBottom: "30px",
  },
  button: {
    display: "inline-block",
    padding: "12px 25px",
    background: "#ffb100",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    transition: "0.3s",
  },
};

export default NotFound;