// src/users/enums/user-type.enum.ts
export enum UserType {

 
  SUBSCRIBER = 'subscriber',
  
  Buyer_PREMIUM = 'buyer_premium',
  SELLER_BASIC = 'seller_basic', //like subscriber
  SELLER_LISTING = 'seller_listing',
  SELLER_CENTRAL = 'seller_central',
  MA_EXPERT_BASIC = 'm&a_expert_basic', // underscore instead of space (recommended)
  MA_EXPERT_PREMIUM = 'm&a_expert_premium', // underscore instead of space (recommended)


  ADMIN = 'admin',
  INVITED_MEMBER = 'invited_member',
  BUYER_BASIC = 'buyer_basic',
  SELLER_BROKER = 'seller_broker',
  SELLER_INDIVIDUAL = 'seller_individual',
}
