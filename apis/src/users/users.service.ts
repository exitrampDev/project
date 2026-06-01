// src/users/users.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-user.dto';
import { ApiFeatures } from 'src/common/utils/api-features';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserType } from './enums/user-type.enum';
import { Business, BusinessDocument } from 'src/business-listing/schemas/business.schema';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  //login by id
   async findById(_id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id }).exec();
  }

  async update(userId: string, updateData: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
    
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


    async findAllBrokers(query: QueryUsersDto) {
    const features = new ApiFeatures(this.userModel);
     
    const result = await features.paginateAndFilter({
      ...query,
      searchFields: ['name', 'email'],   
      baseFilter: { isDeleted: false,  user_type: UserType.SELLER_BROKER },     
     
    });
   
    // --- password remove karna
    result.data = (result.data as any[]).map((user: any) => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    result.data = await Promise.all(result.data.map(async (user: any) => {
      const business = await this.businessModel.find({ ownerId: user._id.toString() }).select('id listingTitle businessState businessCountry cashFlow askingPrice image ').exec();
      return { ...user, businesses: business };
    }));

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
// ---------------------------------------------------------------------
 async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found...');
    }

    user.profile = {
      ...(user.profile || {}),
      ...(dto.profile || {}),
    };
    await user.save();

    return {
      message: 'Profile updated successfully',
      profile: user.profile,
    };
  }

  async getAllUsersTotal() {
    return await this.userModel.countDocuments({ isDeleted: false, user_type: { $ne: UserType.ADMIN } });
  }

  async getAllUsersBrokerTotal() {
    return await this.userModel.countDocuments({ isDeleted: false, user_type: UserType.SELLER_BROKER });
  }

   async getIndividulaSellerTotal() {
    return await this.userModel.countDocuments({ isDeleted: false, user_type: UserType.SELLER_INDIVIDUAL });
  }

     async getBuyerTotal() {
    return await this.userModel.countDocuments({ isDeleted: false, user_type: UserType.BUYER_BASIC });
  }
}