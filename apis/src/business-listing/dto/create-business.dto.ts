import { IsString, IsOptional, IsArray, IsNumber, Matches, IsObject, IsBoolean, IsEnum, IsNotEmpty, IsEmail, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { UniqueInCollection } from 'src/common/decorators/unique-in-collection.validator';

// Business status allowed values
export enum BusinessStatus {
  PENDING_FOR_PAYMENT = 'pending_for_payment',
  LIVE = 'live',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  BLOCK = 'block',
}

// CIM status allowed values
export enum CimStatus {
  READY_TO_SHARE = 'ready_to_share',
  INCOMPLETE = 'incomplete',
  NOT_READY = 'not_ready',
}

export class CreateBusinessDto {

 

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  // @IsString()
  listingTitle?: string;

  @IsOptional()
  @IsString()
  listingDescription?: string;

  @IsOptional()
  @IsString()
  timeInBusiness?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  yearStablished?: number;

  @IsOptional()
  @IsString()
  businessCity?: string;

  @IsOptional()
  @IsString()
  businessState?: string;

  @IsOptional()
  @IsString()
  businessCountry?: string;


  // ----------------- Ownership & Structure -----------------
  @IsOptional()
  @IsString()
  ownershipStructure?: string;

  @IsOptional()
  @IsString()
  isOwnerInvolved?: 'yes' | 'no';

  @IsOptional()
  @IsString()
  ownershipBreakdown?: string;

  @IsOptional()
  @IsString()
  yourRole?: string;

  @IsOptional()

  @IsString()
  willingToCoBroker?: string;

  @IsOptional()
  @IsString()
  @UniqueInCollection({ collection: 'businesses', field: 'listingReferenceNumber', message: 'Listing reference number must be unique' })
  listingReferenceNumber?: string;

  @IsOptional()

  @IsString()
  confidentiality?: string;

 
  @IsEnum({ yes: 'yes', no: 'no' })
  @IsString()
  showContactOnListing?: 'yes' | 'no';

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  // @IsOptional()
  @IsString()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactZipCode?: string;

  @IsOptional()
  @IsString()
  contactAddress?: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsString()
  legalCompanyName?: string;

  @IsOptional()
  @IsString()
  legalIntity?: string;

  @IsOptional()
  @IsString()
  stateOfFormation?: string;

  @IsOptional()
  @IsString()
  naicsCode?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  yearsOwned?: number;

  @IsOptional()
  @IsString()
  reasonForSelling?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessZipCode?: string;

  @IsOptional()
  @IsString()
  postCloseSupport?: string;

  // ----------------- Workforce -----------------
  @IsOptional()
  workforceAllocation?: any;

  @IsOptional()
  @IsString()
  // @IsNumber()
  // @Transform(({ value }) => parseInt(value, 10))
  numberOfEmployees?: string;

  @IsOptional()
  @IsString()
  employes?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  averageTenureInYears?: number;

  @IsOptional()
  @IsString()
  laborMarket?: string;

  @IsOptional()
  @IsString()
  workforceOverview?: string;

  @IsOptional()
  @IsString()
  ownershipInvolvement?: string;

  @IsOptional()

  managementWillingToStay?: string;

  // ----------------- Industry & Financials -----------------
  @IsOptional()
  industry?: string;

  @IsOptional()
  @IsInt()
  revenue?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  askingPrice?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  cashFlow?: number;

  // ----------------- Status -----------------
  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;

  @IsOptional()
  @IsEnum(CimStatus)
  cimStatus?: CimStatus;

  // ----------------- Additional descriptive fields -----------------
  @IsOptional()
  affiliateCompanies?: string;

  @IsOptional()
  growthExpansion?: string;

  @IsOptional()
  @IsString()
  ownerMessage?: string;

  @IsOptional()
  @IsString()
  franchise?: string;

  @IsOptional()
  @IsString()
  isFranchise?: string;

  @IsOptional()
  @IsString()
  isRelocatable?: string;

  @IsOptional()
  @IsString()
  isStartup?: string;

  @IsOptional()
  @IsString()
  supportAndTraining?: string;

  @IsOptional()
  @IsString()
  productsAndServices?: string;

  @IsOptional()
  productRevenueMix?: any;

  @IsOptional()
  @IsString()
  industryAnalysis?: string;

  @IsOptional()
  @IsString()
  competitorAnalysis?: string;

  @IsOptional()
  competitors?: any;

  @IsOptional()
  customersAndConcentration?: any;

  @IsOptional()
  marketingAndSalesTactics?: string;

  @IsOptional()
  @IsString()
  seasonality?: string;

  @IsOptional()
  keySuppliers?: any

  @IsOptional()
  @IsBoolean()
  pendingLawsuits?: boolean;

  @IsOptional()
  @IsString()
  pendingLawsuitsDescription?: string;

  @IsOptional()
  @IsBoolean()
  liens?: boolean;

  @IsOptional()
  @IsString()
  liensDescription?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  physicalLocations?: string;

  @IsOptional()
  @IsString()
  facilityAndLocationDetails?: string;

  @IsOptional()
  @IsString()
  propertyIncludededInSale?:string;

  @IsOptional()
  @IsString()
  propertyIncludedinAskingPrice?:string;

  @IsOptional()
  propertiesIncluded?: any;

  @IsOptional()
   @IsString()
  isPropertyLeased?: any;

  @IsOptional()
  @IsString()
  MonthlyRentAmount?: any;

  @IsOptional()
  @IsString()
  leaseExpiration?: string;


  @IsOptional()
  buildingSF?: string;

  @IsOptional()
  @IsString()
  ffEValueIncludeinAskingPrice?:string;


  @IsOptional()
  @IsString()
  ffeDescription?: string;

  @IsOptional()

  ffeAssets?: any;

  @IsOptional()
  financing?: any;

  @IsOptional()
  @IsNumber()
  ffEValue?: number;

  @IsOptional()
  inventoryIncludedinAskingPrice?: boolean;

  @IsOptional()
  @IsNumber()
  inventoryValue?: number;

  @IsOptional()
  @IsString()
  inventoryIncluded?: string;

  @IsOptional()
  @IsNumber()
  realEstateValue?: number;

  @IsOptional()
  @IsString()
  realEstate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  financialFiles?: string[];

  // ----------------- Files & Images -----------------
  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpg|jpeg|gif);base64,/, { message: 'Invalid image format' })
  image?: string;

  @IsOptional()
  @IsString()
  profitAndLossFile?: string;

  @IsOptional()
  @IsString()
  balanceSheetFile?: string;

  @IsOptional()
  @IsString()
  threeYearTaxReturnFile?: string;

  @IsOptional()
  @IsString()
  ownershipCaptableFile?: string;

  @IsOptional()
  @IsString()
  briefDescription?: string;

  @IsOptional()
  @IsString()
  businessOverview?: string;

  @IsOptional()
  keyHighlights?: string;

  @IsOptional()
  cimUrl?: string;

// -------------------------------------
  @IsOptional()
  latestEBITDA?: string;
  @IsOptional()
  latestSDE?: string;
  @IsOptional()
  @IsString()
  latestNetProfit?: string;
  @IsOptional()
  ffeValue?: string;
// -------------------------------------


  @IsOptional()
  businessDetails?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;
}
