import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (host = "database"): Promise<Connection> => {
  host = process.env.NODE_ENV === "test" ? "localhost" : host;
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, { host })
  );
}
