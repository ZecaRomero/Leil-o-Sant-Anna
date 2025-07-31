import Layout from "../components/Layout";
import GestationManager from "../components/GestationManager";

export default function GestacaoPage({ darkMode, toggleDarkMode }) {
  return (
    <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      <GestationManager />
    </Layout>
  );
}
