import  request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import getConnection from "../../../../database";

let connection: Connection;
describe("get balance", () => {

  beforeAll(async () => {
    connection = await getConnection();
    await connection.runMigrations();
  });
  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })
  it("should be able to return a balance" , async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "test",
      email: "test@mail.com",
      password: "123456"
    });

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    })


    const { token } = response.body;

    await request(app)
    .post("/api/v1/statements/deposit")
    .auth(token, { type: "bearer" })
    .send({
      amount: 100,
      description: "deposit",
    })

    response = await request(app)
    .get("/api/v1/statements/balance")
    .auth(token, {type: "bearer"});

    expect(response.body).toHaveProperty("balance");

  });

  it("should not be able to return a balance when user does not exists" , async () => {

    let response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    })

    const { token } = response.body;

    await connection.query("DELETE FROM users where email = 'test@mail.com'");


    response = await request(app)
    .get("/api/v1/statements/balance")
    .auth(token, {type: "bearer"});

    expect(response.statusCode).toEqual(404);

  });
})
