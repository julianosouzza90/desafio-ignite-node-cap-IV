import { DataSource } from "typeorm";

const appDataSource = new DataSource({
  username: "postgres",
  password: "docker",
  type: "postgres",
  host: "localhost",
  port: 5432,
  database: "fin_api",
  entities: [
    "./src/modules/**/entities/*.ts"
  ],
  migrations: [
    "./src/database/migrations/*.ts"
  ],
})

const createConnection =  async (host = "database"): Promise<DataSource> => {
  if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    host = "localhost";
  } else {
    host = host;
  }
  appDataSource.setOptions({
    host,
  });
  return await appDataSource.initialize();
}

export { createConnection };
export default appDataSource;
