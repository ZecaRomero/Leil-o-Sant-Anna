import Layout from "../components/Layout";
import ModernDashboard from "../components/ModernDashboard";

export default function Dashboard({ darkMode, toggleDarkMode }) {
  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <ModernDashboard />
    </Layout>
  );
}
