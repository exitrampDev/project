// src/nda/nda.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Nda, NdaDocument } from './schemas/nda.schema';
import { CreateNdaDto } from './dto/create-nda.dto';
import { QueryNdaDto } from './dto/query-nda.dto';
import { Business, BusinessDocument } from 'src/business-listing/schemas/business.schema';
import { NotificationHelper } from 'src/common/helpers/notification.helper';
import { ApproveNdaDto } from './dto/approve-nda.dto';
import { MailService } from 'src/common/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { PdfService } from 'src/common/pdf/pdf.service';

@Injectable()
export class NdaService {
  constructor(
    @InjectModel(Nda.name) private readonly ndaModel: Model<NdaDocument>,
     @InjectModel(Business.name) private readonly businessModel: Model<BusinessDocument>,
     private readonly notificationHelper: NotificationHelper,
       private readonly mailService: MailService,
       private readonly userService: UsersService,
       private readonly pdfService: PdfService,
  ) {}

  // User submits NDA
  async create(dto: CreateNdaDto, userId: string | Types.ObjectId) {
    const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    // Check if NDA already exists
    const existingNda = await this.ndaModel.findOne({
      businessId: dto.businessId,
      submittedBy: userObjectId,
    });

    if (existingNda) {
      throw new BadRequestException('You have already applied');
    }

    // Find business
    const business = await this.businessModel.findById(dto.businessId);
    if (!business || !business.ownerId) {
      throw new BadRequestException('Business or owner not found');
    }

    // Create NDA
    const newNda = new this.ndaModel({
      businessId: new Types.ObjectId(dto.businessId),
      businessOwnerId: business.ownerId,
      submittedBy: userObjectId,
      status: 'pending',
       // Base64 fields (only set if provided)
      buyerSignature: dto.buyerSignature,
      sellerSignature: dto.sellerSignature,
      agreedDocument: dto.agreedDocument,
    });

    // Create notification for business owner
    await this.notificationHelper.createNotification({
      userId: new Types.ObjectId(business.ownerId),
      title: 'NDA Submitted',
      message: `A new NDA has been submitted for on your business "${business.listingTitle}"`,
    });

    // Create notification for submitter (buyer)
    await this.notificationHelper.createNotification({
      userId: userObjectId,
      title: 'NDA Submitted',
      message: `You have successfully submitted an NDA for the business "${business.listingTitle}"`,
    });

    // Send email to business owner
    let businessOwner = await this.userService.findById(business.ownerId.toString());
    if(businessOwner){   await this.mailService.sendMail(
      businessOwner.email,
      'New NDA Submission',
      'ndaSubmitted',
      {
        message: `A new NDA has been submitted for your business "${business.listingTitle}". Please review it at your earliest convenience.`,
      }
    );
  }

    return newNda.save();
  }

 
//find all ka kaam
  async findAll(query: QueryNdaDto, userId: string) {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      ndaStatus,
      cimStatus,
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    // Sirf current user ka data
    const matchFilter: any = { submittedBy: new Types.ObjectId(userId) };

    if (ndaStatus) matchFilter.status = ndaStatus;
    if (cimStatus) matchFilter.cimAccess = cimStatus;

    const aggregationPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { listingTitle: 1, businessType: 1, cimUrl:1, ownerId: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedBy',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // 👉 Search ko lookup ke baad lagana hai (businessName ke liye)
    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.listingTitle': { $regex: search, $options: 'i' } }, // 👈 new
          ],
        },
      });
    }

    aggregationPipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          businessId:1,
          docRoomAccess:1,
          listingTitle: { $ifNull: ['$business.listingTitle', 'N/A'] },
          businessType: { $ifNull: ['$business.businessType', 'N/A'] },
          ownerId: { $ifNull: ['$business.ownerId', 'N/A'] },
          ndaStatus: '$status',
          // cimUrl: { $ifNull: ['$business.cimUrl', 'N/A'] },
          cimAccess: 1,
          cimUrl: {
                    $cond: {
                      if: { $eq: ['$cimAccess', 'approved'] },
                      then: { $ifNull: ['$business.cimUrl', 'N/A'] },
                      else: null
                    }
                  },
        
          submittedOn: '$createdAt',
          sellerResponseOn: 1,
          message: 1,
          submittedByEmail: '$user.email',
          buyerName: {
            $let: {
              vars: {
                full: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ['$user.first_name', ''] },
                        ' ',
                        { $ifNull: ['$user.last_name', ''] }
                      ]
                    }
                  }
                }
              },
              in: { $cond: [{ $eq: ['$$full', ''] }, 'N/A', '$$full'] }
            }
          },
          submittedByRole: { $ifNull: ['$user.role', 'N/A'] },
        },
      }
    );

    const data = await this.ndaModel.aggregate(aggregationPipeline).exec();

    // Count pipeline bhi search ko consider karega
    const countPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    const countResult = await this.ndaModel.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForOwner(query: QueryNdaDto, userId: string, businessId: string) {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      ndaStatus,
      cimStatus,
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    // Sirf current user ka data
    const matchFilter: any = { businessOwnerId: userId };

    if (ndaStatus) matchFilter.status = ndaStatus;
    if (cimStatus) matchFilter.cimAccess = cimStatus;

    const aggregationPipeline: PipelineStage[] = [
      { $match: matchFilter },
     
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { listingTitle: 1, businessType: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },

       {
        $lookup: {
          from: 'users',
          let: { submittedByObj: { $toObjectId: "$submittedBy" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$submittedByObj"] } } },
            // { $project: { firstName: 1, lastName: 1, email: 1 } }
          ],
          as: 'buyer'
        }
      },
      { $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true } },
      
    ];

    

    // 👉 Search ko lookup ke baad lagana hai (businessName ke liye)
    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.listingTitle': { $regex: search, $options: 'i' } }, // 👈 new
          ],
        },
      });
    }

    aggregationPipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          businessId:1,
          submittedBy:1,
          docRoomAccess:1,
          buyerSignature:1,
          sellerSignature:1,
          listingTitle: { $ifNull: ['$business.listingTitle', 'N/A'] },
          businessType: { $ifNull: ['$business.businessType', 'N/A'] },
          ndaStatus: '$status',
          cimAccess: 1,
          submittedOn: '$createdAt',
          sellerResponseOn: 1,
          message: 1,
          submittedByEmail: '$buyer.email',        
          buyer: '$buyer',         
          submittedByRole: { $ifNull: ['$buyer.role', 'N/A'] },
        },
      }
    );

    const data = await this.ndaModel.aggregate(aggregationPipeline).exec();

    // Count pipeline bhi search ko consider karega
    const countPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    const countResult = await this.ndaModel.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

    async findAllForOwnerDoc(query: QueryNdaDto, userId: string, businessId: string) {
    const {
      search = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      ndaStatus,
      cimStatus,
    } = query;

    const sortOrder = order === 'desc' ? -1 : 1;

    // Sirf current user ka data
    const matchFilter: any = { businessOwnerId: userId, businessId: new Types.ObjectId(businessId) };

    if (ndaStatus) matchFilter.status = ndaStatus;
    if (cimStatus) matchFilter.cimAccess = cimStatus;

    const aggregationPipeline: PipelineStage[] = [
      { $match: matchFilter },
    //  {
    //   $lookup: {
    //     from: 'buyers',
    //     localField: 'submittedBy',
    //     foreignField: 'userId',
    //     as: 'buyer',
    //   }
    // },
    // {
    //   $unwind: { path: '$buyer', preserveNullAndEmptyArrays: true }
    // },

   {
    $lookup: {
      from: 'buyers',
      let: { buyerIdObj: "$submittedBy" },
      pipeline: [
        {
          $match: {  $expr: {
              $eq: [
                { $toObjectId: "$userId" }, 
                "$$buyerIdObj"             
              ]
            }
          }
        }
      ],
      as: 'buyer'
    }
  },
     
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { listingTitle: 1, businessType: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'submittedBy',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    ];

    // 👉 Search ko lookup ke baad lagana hai (businessName ke liye)
    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.listingTitle': { $regex: search, $options: 'i' } }, // 👈 new
          ],
        },
      });
    }

    aggregationPipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          businessId:1,
          submittedBy:1,
          docRoomAccess:1,
          buyerSignature:1,
          sellerSignature:1,
          listingTitle: { $ifNull: ['$business.listingTitle', 'N/A'] },
          businessType: { $ifNull: ['$business.businessType', 'N/A'] },
          ndaStatus: '$status',
          cimAccess: 1,
          submittedOn: '$createdAt',
          sellerResponseOn: 1,
          message: 1,
          submittedByEmail: '$user.email',
          // buyer_data: '$buyer', //for all buyers in array
          buyer: { $ifNull: [{ $arrayElemAt: ['$buyer', 0] }, {}] },
          buyerName: {
            $let: {
              vars: {
                full: {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ['$user.first_name', ''] },
                        ' ',
                        { $ifNull: ['$user.last_name', ''] }
                      ]
                    }
                  }
                }
              },
              in: { $cond: [{ $eq: ['$$full', ''] }, 'N/A', '$$full'] }
            }
          },
          submittedByRole: { $ifNull: ['$user.role', 'N/A'] },
        },
      }
    );

    const data = await this.ndaModel.aggregate(aggregationPipeline).exec();

    // Count pipeline bhi search ko consider karega
    const countPipeline: PipelineStage[] = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'businesses',
          let: { businessIdObj: { $toObjectId: "$businessId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$businessIdObj"] } } },
            { $project: { businessName: 1 } }
          ],
          as: 'business'
        }
      },
      { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } },
    ];

    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { message: { $regex: search, $options: 'i' } },
            { cimAccess: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
            { 'business.businessName': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    countPipeline.push({ $count: 'total' });

    const countResult = await this.ndaModel.aggregate(countPipeline).exec();
    const total = countResult[0]?.total || 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  ///reject ka kaam hai ye

  async rejectNda(ndaId: string, userId: string): Promise<Nda> {
    const nda = await this.ndaModel.findById(ndaId);
    if (!nda) throw new NotFoundException('NDA not found');

    // Check property owner
    const business = await this.businessModel.findById(nda.businessId);
    if (!business) throw new NotFoundException('Business not found');

    if (business.ownerId.toString() !== userId) {
      throw new ForbiddenException('You are not authorized to reject this NDA');
    }

    nda.sellerResponseOn = new Date();
    nda.status = 'rejected';
    await nda.save();
      console.log('Sending notification to:', nda.submittedBy);
    await this.notificationHelper.createNotification({
        // new Types.ObjectId(commentDto.createdBy),
        userId: new Types.ObjectId(nda.submittedBy),    
        title: 'Reject Nda',
        message: `Your request has been rejected`,
      });

       // ----------------------- Email Notification
      let buyer = await this.userService.findById(nda.submittedBy.toString());
      if(buyer){
        await this.mailService.sendMail(
          buyer.email,
          'NDA Rejected',
          'generalMessage',
          {
            receiverName: buyer.first_name ? buyer.first_name : 'User',
            message: `Your NDA request has been rejected.`,
          }
        );
      }
      // -----------------------
    return nda;
  }

  //approve ka kaam hai ye 
  async approveNda(ndaId: string, userId: string, data: ApproveNdaDto): Promise<Nda>{
     const nda = await this.ndaModel.findById(ndaId);
     if(!nda) throw new NotFoundException("Nda Not Found");
      console.log('NDA found:', nda); 
      
     //property owmer ko check kar raha hun
     const business = await this.businessModel.findById(nda.businessId);
     if(!business) throw new NotFoundException("Business Not Found");
     if(business.ownerId.toString() !== userId){
      throw new ForbiddenException("You Are Not Authorized To Approve This Nda")
     }
     
     nda.sellerResponseOn = new Date();
     nda.status = 'approved';
     nda.cimAccess = 'approved';
     nda.sellerSignature = data.sellerSignature;
     await nda.save();
    const ndaData = await this.ndaModel.findById(ndaId).populate(['businessId','submittedBy', 'businessOwnerId']);
     await this.notificationHelper.createNotification({
        // new Types.ObjectId(commentDto.createdBy),
        userId: nda.submittedBy,    
        title: 'Flag Submitted',
        message: `Your request has been approved.`,
      });
       // ------------------------------
       let ndaUrl:any = null;
      ndaUrl =  await this.pdfService.generateNda(ndaData)
    //  .then((pdfUrl) => {
      //   ndaUrl = pdfUrl;
      //   console.log('PDF generated and saved at:', pdfUrl);
        
      // }).catch((err) => {
      //     console.error('Error generating PDF:', err);
      //   });
      // // ------------------------------
      // ----------------------- Email Notification
      let buyer = await this.userService.findById(nda.submittedBy.toString());
      // let seller = await this.userService.findById(nda.businessOwnerId.toString());
      if(buyer){
        await this.mailService.sendMailWithFiles(
          buyer.email,
          'NDA Approved',
          'generalMessage',
          {
            receiverName: buyer.first_name ? buyer.first_name : 'User',
            message: `Your NDA request has been approved.`,
            
          },
          [ {
          filename: 'nda.pdf',
          path: ndaUrl,
        },]
        );
      }
      // -----------------------
     

     return nda;
  }

    async allowDocRoom(ndaId: string, userId: string): Promise<Nda>{
     const nda = await this.ndaModel.findById(ndaId);
     if(!nda) throw new NotFoundException("Nda Not Found");

     //property owmer ko check kar raha hun
     const business = await this.businessModel.findById(nda.businessId);
     if(!business) throw new NotFoundException("Business Not Found");
     
     if(business.ownerId.toString() !== userId){
      throw new ForbiddenException("You Are Not Authorized To Approve This Nda")
     }
     
     nda.sellerResponseOn = new Date();
     nda.docRoomAccess = 'approved';
     await nda.save();

     await this.notificationHelper.createNotification({
        // new Types.ObjectId(commentDto.createdBy),
        userId: nda.submittedBy,    
        title: 'Flag Submitted',
        message: `Your request has been Allow.`,
      });
      // ----------------------- Email Notification
      let buyer = await this.userService.findById(nda.submittedBy.toString());
      if(buyer){
        await this.mailService.sendMail(
          buyer.email,
          'Doc Room Access Granted',
          'generalMessage',
          {
            receiverName: buyer.first_name ? buyer.first_name : 'User',
            message: `Your request for Doc Room access has been granted.`,
          }
        );
      }
      // -----------------------

     return nda;
  }

    async rejectDocRoom(ndaId: string, userId: string): Promise<Nda>{
     const nda = await this.ndaModel.findById(ndaId);
     if(!nda) throw new NotFoundException("Nda Not Found");

     //property owmer ko check kar raha hun
     const business = await this.businessModel.findById(nda.businessId);
     if(!business) throw new NotFoundException("Business Not Found");
     
     if(business.ownerId.toString() !== userId){
      throw new ForbiddenException("You Are Not Authorized To Approve This Nda")
     }
     
     nda.sellerResponseOn = new Date();
     nda.docRoomAccess = 'rejected';
     await nda.save();

     await this.notificationHelper.createNotification({
        // new Types.ObjectId(commentDto.createdBy),
        userId: nda.submittedBy,    
        title: 'Flag Submitted',
        message: `Your request has been rejected.`,
      });

      // ------------------------------- Email Notification
      let buyer = await this.userService.findById(nda.submittedBy.toString());
      if(buyer){
        await this.mailService.sendMail(
          buyer.email,
          'Doc Room Access Revoked',
          'generalMessage',
          {
            receiverName: buyer.first_name ? buyer.first_name : 'User',
            message: `Your Doc Room access has been revoked.`,
          }
        );
      }
     return nda;
  }

  async getAllNdaTotal() {
    return await this.ndaModel.countDocuments({});
  }

  async getAllNdaTotalOnMyListing(ownerId: string) {
    let myBusinesses = await this.businessModel.find({ ownerId: ownerId }).select('_id').exec();
    let myBusinessIds = myBusinesses.map(b => b._id);
    return await this.ndaModel.countDocuments({ businessId: { $in: myBusinessIds } });
  }

   async getAllApprovedNdaTotal(ownerId: string) {
    let myBusinesses = await this.businessModel.find({ ownerId: ownerId }).select('_id').exec();
    let myBusinessIds = myBusinesses.map(b => b._id);
    return await this.ndaModel.countDocuments({ businessId: { $in: myBusinessIds }, status: 'approved', cimAccess: 'approved' });
  }

   async getAllMyRejectedNdaTotal(ownerId: string) {
    let myBusinesses = await this.businessModel.find({ ownerId: ownerId }).select('_id').exec();
    let myBusinessIds = myBusinesses.map(b => b._id);
    return await this.ndaModel.countDocuments({ businessId: { $in: myBusinessIds }, status: 'rejected' });
  }

  async getCimUrl(ndaId: string, userId: string): Promise<string> {
    const nda = await this.ndaModel.findById(ndaId);
    if (!nda) throw new NotFoundException('NDA not found');

    if (nda.submittedBy.toString() !== userId && nda.status !== 'approved' && nda.cimAccess !== 'approved') {
      throw new ForbiddenException('You are not authorized to access this file');
    }

    // Check property owner
    const business = await this.businessModel.findById(nda.businessId);
    if (!business) throw new NotFoundException('Business not found');
      
    return business.cimUrl??'N/A';
  }

}
