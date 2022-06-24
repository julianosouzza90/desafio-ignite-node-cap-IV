import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";

import getConnection from "../../../../database/";

let connection: Connection;
describe("get an statement operation", () => {

  beforeAll(async() => {
     connection = await getConnection();
     await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list a statement operation", async() => {

    await request(app)
    .post("/api/v1/users")
    .send({
      name: "user Test",
      email: "test@mail.com",
      password: "123456"
    });

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });

    const { token } = response.body;

    response = await request(app)
    .post("/api/v1/statements/deposit")
    .auth(token, { type: "bearer" })
    .send({
      amount: 100,
      description: "deposit"
    });

    const { id: statement_id } = response.body;


    response =  await request(app)
    .get(`/api/v1/statements/${statement_id}`)
    .auth(token, { type: "bearer" });

    expect(response.body).toHaveProperty("id");

  });
  it("should not be able to list a statement operation when it does not exists", async () => {

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });

    const { token } = response.body;

    response = await request(app)
    .post("/api/v1/statements/deposit")
    .auth(token, { type: "bearer" })
    .send({
      amount: 100,
      description: "deposit"
    });

    const { id: statement_id } = response.body;

    await connection.query("DELETE FROM statements");

    response =  await request(app)
    .get(`/api/v1/statements/${statement_id}`)
    .auth(token, { type: "bearer" });

    expect(response.statusCode).toEqual(404);

  });

  it("should not be able to list a statement operation when user does not exists", async () => {

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });

    const { token } = response.body;

    response = await request(app)
    .post("/api/v1/statements/deposit")
    .auth(token, { type: "bearer" })
    .send({
      amount: 100,
      description: "deposit"
    });

    const { id: statement_id } = response.body;

    await connection.query("DELETE FROM users");

    response =  await request(app)
    .get(`/api/v1/statements/${statement_id}`)
    .auth(token, { type: "bearer" });

    expect(response.statusCode).toEqual(404);

  });



})
