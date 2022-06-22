import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create Statement", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create a new statement", async () => {
    const passwordHash = await hash("123456", 8);
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash
    });
    const id = user.id as string;

    const statement = await createStatementUseCase.execute({
      user_id: id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit of salary"
    });

    expect(statement).toHaveProperty("id");

  });


  it("should not be able to create a withdrawal transaction if the balance is less than the requested amount", async () => {

    await expect(async () => {
      const passwordHash = await hash("123456", 8);
      const user = await usersRepositoryInMemory.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: passwordHash
      });
      const id = user.id as string;

      await createStatementUseCase.execute({
        user_id: id,
        type: OperationType.WITHDRAW,
        amount: 500,
        description: "deposit of salary"
      });

    }).rejects.toBeInstanceOf(AppError);

  });
});
