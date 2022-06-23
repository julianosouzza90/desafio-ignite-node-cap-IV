import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
let connection: Connection;

describe("Create user",  () => {
  beforeAll(async() => {
    connection = await createConnection("localhost");
    await connection.runMigrations();
  });
  afterAll(async()=> {
    await connection.dropDatabase();
    await connection.close();
  });
  it("should be able to create a new user", async () => {

    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "John Doe",
      email: "test@mail.com",
      password: "123456",
    });

    expect(response.status).toEqual(201);

  });

  it("should not be able to create a user if the email is already registered", async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "John Doe",
      email: "test@mail.com",
      password: "123456",
    });

    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "John Doe",
      email: "test@mail.com",
      password: "123456",
    });
    expect(response.status).toEqual(400);
  })
})
