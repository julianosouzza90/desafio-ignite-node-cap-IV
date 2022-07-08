import { getRepository, Repository } from "typeorm";
import appDataSource from "../../../database";

import { User } from "../entities/User";
import { ICreateUserDTO } from "../useCases/createUser/ICreateUserDTO";
import { IUsersRepository } from "./IUsersRepository";

export class UsersRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = appDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User|null> {
   const user = await this.repository.findOneBy({email});
   return user;
  }

  async findById(user_id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id: user_id },
    });

  }

  async create({ name, email, password }: ICreateUserDTO): Promise<User> {
    const user = this.repository.create({ name, email, password });

    return this.repository.save(user);
  }
}
