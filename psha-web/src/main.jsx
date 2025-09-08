import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Layout from "./components/ui/Layout";
import './index.css';

function AppWrapper() {
  const [activeTab, setActiveTab] = React.useState("analysis");

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <App activeTab={activeTab} setActiveTab={setActiveTab} />
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);