import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create Statement", () => {

  beforeEach(() => {
     usersRepositoryInMemory = new  InMemoryUsersRepository();
     statementsRepositoryInMemory = new  InMemoryStatementsRepository();
     getStatementOperationUseCase = new  GetStatementOperationUseCase(
        usersRepositoryInMemory,
        statementsRepositoryInMemory
      );
  });

  it("should  be able to return a statement", async () => {
    const passwordHash = await hash("123456", 8);
    const user = await usersRepositoryInMemory.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: passwordHash
    });
    const id = user.id as string;

    const statement = await statementsRepositoryInMemory.create({
      user_id: id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "deposit of salary"
    });

    const returnedStatement = await getStatementOperationUseCase.execute({
      user_id: id,
      statement_id: statement.id as string
    });
    expect(returnedStatement.amount).toBe(100);
    expect(returnedStatement).toHaveProperty("id");

  });
  it("should not be able to return a statement when the user is non-existent", async () => {

    await expect(async () => {

      const passwordHash = await hash("123456", 8);
      const user = await usersRepositoryInMemory.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: passwordHash
      });
      const id = user.id as string;

      const statement = await statementsRepositoryInMemory.create({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit of salary"
      });

      await getStatementOperationUseCase.execute({
        user_id: "inexistent-user-id",
        statement_id: statement.id as string
      })

    }).rejects.toBeInstanceOf(AppError);


  });

  it("should not be able to return a statement when it is non-existent", async () => {

    await expect(async () => {

      const passwordHash = await hash("123456", 8);
      const user = await usersRepositoryInMemory.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: passwordHash
      });
      const id = user.id as string;

      const statement = await statementsRepositoryInMemory.create({
        user_id: id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit of salary"
      });

      await getStatementOperationUseCase.execute({
        user_id: id,
        statement_id: 'statement-id-inexistent'
      })

    }).rejects.toBeInstanceOf(AppError);


  });


});
