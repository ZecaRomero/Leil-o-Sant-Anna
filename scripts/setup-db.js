const { Client } = require("pg");

async function setupDatabase() {
  // Conectar ao PostgreSQL sem especificar banco
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "1234",
    database: "postgres", // Conecta ao banco padrão primeiro
  });

  try {
    await client.connect();
    console.log("Conectado ao PostgreSQL");

    // Verificar se banco beef_sync existe
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'beef_sync'"
    );

    if (result.rows.length === 0) {
      // Criar banco beef_sync
      await client.query("CREATE DATABASE beef_sync");
      console.log("Banco beef_sync criado com sucesso");
    } else {
      console.log("Banco beef_sync já existe");
    }

    await client.end();
    console.log("Setup do banco concluído");
  } catch (error) {
    console.error("Erro no setup do banco:", error.message);
    console.log("\nVerifique:");
    console.log("1. Se o PostgreSQL está rodando");
    console.log("2. Se as credenciais no .env estão corretas");
    console.log("3. Se o usuário tem permissões para criar bancos");
  }
}

setupDatabase();
