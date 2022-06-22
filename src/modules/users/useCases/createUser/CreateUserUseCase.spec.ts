import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";


let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
describe("Create a user", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  })
  it("should be able to create a new user", async () => {
     const response =  await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example",
        password: "123456",
      });

      expect(response).toHaveProperty("id");
  });

  it("should not be able to create a new user when email already exists", async () => {

    await expect(async() => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@example",
        password: "123456",
    });
    await createUserUseCase.execute({
      name: "John Doe",
      email: "john@example",
      password: "123456",
  });
    }).rejects.toBeInstanceOf(AppError);

  });
});
