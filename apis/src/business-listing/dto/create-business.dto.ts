import { IsString, IsOptional, IsArray, IsNumber, Matches, IsObject, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

// Business status allowed values
export enum BusinessStatus {
  LIVE = 'live',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

// CIM status allowed values
export enum CimStatus {
  READY_TO_SHARE = 'ready_to_share',
  INCOMPLETE = 'incomplete',
  NOT_READY = 'not_ready',
}

export class CreateBusinessDto {

  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  businessType?: string;

  @IsOptional()
  @IsString()
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
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

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
  listingReferenceNumber?: string;

  @IsOptional()

  @IsString()
  confidentiality?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
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
  PostCloseSupport?: string;

  // ----------------- Workforce -----------------
  @IsOptional()
  workforceAllocation?: any;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  numberOfEmployees?: number;

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
  @IsString()
  annualRevenue?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  askingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
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
  @IsBoolean()
  isFranchise?: boolean;

  @IsOptional()
  @IsBoolean()
  isRelocatable?: boolean;

  @IsOptional()
  @IsBoolean()
  isStartup?: boolean;

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
  propertyIncludedinAskingPrice?:boolean;

  @IsOptional()
  propertiesIncluded?: any;

  @IsOptional()
  leaseExpiration?: string;

  @IsOptional()
  buildingSF?: string;

  @IsOptional()
  ffEValueIncludeinAskingPrice?:boolean;


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
  @IsNumber()
  inventoryValue?: number;

  @IsOptional()
  @IsString()
  inventoryIncluded?: number;

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

// -------------------------------------
  @IsOptional()
  latestEBITDA?: string;
  @IsOptional()
  latestSDE?: string;
  @IsOptional()
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
