// src/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-user.dto';
import { ApiFeatures } from 'src/common/utils/api-features';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User & { _id: any }, 'password'>> {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const createdUser = new this.userModel({
      ...createUserDto,
      email: normalizedEmail,
    });

    const savedUser = await createdUser.save();
    const { password, ...userWithoutPassword } = savedUser.toObject();
    return userWithoutPassword;
}
  async findAll(query: QueryUsersDto) {
    const features = new ApiFeatures(this.userModel);
     
    const result = await features.paginateAndFilter({
      ...query,
      searchFields: ['name', 'email'],   
      baseFilter: { isDeleted: false },  
    });

    // --- password remove karna
    result.data = (result.data as any[]).map((user: any) => {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  });

    return result;
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) return null;
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async updatePassword(userId: string, hashedPassword: string) {
  return this.userModel.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });
}
}