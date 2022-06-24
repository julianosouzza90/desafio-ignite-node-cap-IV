import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import  getConnection  from "../../../../database";
import { app } from "../../../../app";

let connection: Connection;


describe("user authenticate", () => {

  beforeAll(async () => {
    connection = await getConnection();
    await connection.runMigrations();

  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate an user", async() => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "John Doe",
      email: "test@mail.com",
      password: "123456"
    });

    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "123456"
    });

    expect(response.body).toHaveProperty("token");


  });

  it("should not be able to authenticate when user email non-exists", async() => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "John Doe",
      email: "test@mail.com",
      password: "123456"
    });

    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "invalid@mail.com",
      password: "123456"
    });

    expect(response.status).toEqual(401);

  });
  it("should not be able to authenticate an user with wrong password", async() => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name: "John Doe",
      email: "test@mail.com",
      password: "123456"
    });

    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "test@mail.com",
      password: "invalidPassword"
    });

    expect(response.status).toEqual(401);

  })



})
