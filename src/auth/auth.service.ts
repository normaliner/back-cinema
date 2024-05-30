
import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: ReturnModelType<typeof UserModel>
  ) {}

  async register(dto: any) {
    const newUser = new this.userModel(dto);
    return newUser.save();
  }
}
