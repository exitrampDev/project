import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BusinessDocument = Business & Document & { createdAt: Date; updatedAt: Date };

// ----------------- Embedded Schemas -----------------
export class OwnershipSplit {
  @Prop({ type: String, default: '' })
  ownershipDescription: string;

  @Prop({ type: Number, default: 0 })
  ownershipPercentage: number;

  @Prop({ type: String, default: '' })
  responsibilities: string;
}
export const OwnershipSplitSchema = SchemaFactory.createForClass(OwnershipSplit);

export class AffiliateCompany {
  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;
}
export const AffiliateCompanySchema = SchemaFactory.createForClass(AffiliateCompany);

export class Competitor {
  @Prop({ type: String, default: '' })
  competitorName: string;

  @Prop({ type: String, default: '' })
  description: string;
}
export const CompetitorSchema = SchemaFactory.createForClass(Competitor);

export class CustomerConcentration {
  @Prop({ type: String, default: '' })
  customerNameOrDescription: string;

  @Prop({ type: Number, default: 0 })
  customerConcentrationPercentage: number;
}
export const CustomerConcentrationSchema = SchemaFactory.createForClass(CustomerConcentration);

@Schema({ _id: false })
export class WorkforceAllocation {
  @Prop({ type: String, default: 'Full-Time' })
  employeeType: string;

  @Prop({ type: String})
  employes: string;

  @Prop({ type: Number, default: 0 })
  count: number;
}
export const WorkforceAllocationSchema = SchemaFactory.createForClass(WorkforceAllocation);

export class KeySupplier {
  @Prop({ type: String, default: '' })
  vendorName: string;

  @Prop({ type: String, default: '' })
  description: string;
}
export const KeySupplierSchema = SchemaFactory.createForClass(KeySupplier);

export class PropertyIncluded {
  @Prop({ type: String, default: 'Office' })
  locationType: string;

  @Prop({ type: String, default: 'Office' })
  location: string;

  @Prop({ type: String, default: '' })
  usageDescription: string;

  @Prop({ type: String, default: 'Owned' })
  ownership: string;

  @Prop({ type: String, default: 'TBD' })
  includedInSale: string;
}
export const PropertyIncludedSchema = SchemaFactory.createForClass(PropertyIncluded);

export class FFEAsset {
  @Prop({ type: String, default: 'Fixed Assets' })
  assetType: string;

  @Prop({ type: String, default: 'Included' })
  includedOrExcluded: string;

  @Prop({ type: String, default: '' })
  assetDescription: string;

  @Prop({ type: Number, default: 0 })
  estimatedValue: number;
}
export const FFEAssetSchema = SchemaFactory.createForClass(FFEAsset);

export class FinancialEntry {
  @Prop({ type: Number, default: 0 })
  reportingYear: number;

  @Prop({ type: String, default: 0 })
  annualRevenue?: string;

  @Prop({ type: Number, default: 0 })
  ebitda?: number;

  @Prop({ type: Number, default: 0 })
  sde?: number;

  @Prop({ type: Number, default: 0 })
  cashFlow?: number;

  @Prop({ type: Number, default: 0 })
  netProfit?: number;

  @Prop({ type: Number, default: 0 })
  addbackTotal?: number;

  @Prop({ type: String, default: '' })
  addbackDescription?: string;
}
export const FinancialEntrySchema = SchemaFactory.createForClass(FinancialEntry);

// ----------------- Main Business Schema -----------------
@Schema({ timestamps: true })
export class Business {
  @Prop({ required: true })
  businessName: string;

  @Prop({ default: null })
  businessType?: string;

  @Prop({ default: null })
  listingTitle?: string;

  @Prop({ default: null })
  listingDescription?: string;

  @Prop({ default: null })
  timeInBusiness?: string;

  @Prop({ default: null })
  entityType?: string;

  @Prop({ type: Number, default: 2025 })
  yearStablished?: number;

  @Prop({ default: null })
  city?: string;

  @Prop({ default: null })
  state?: string;

  @Prop({ default: null })
  country?: string;

  // ----------------- Ownership & Structure -----------------
  @Prop({ default: null })
  ownershipStructure?: string;

  @Prop({ type: [String], default: [] })
  isOwnerInvolved?: string[];

  @Prop({ default: null })
  ownershipBreakdown?: string;

  @Prop({ type: [OwnershipSplitSchema], default: [] })
  ownershipSplit?: OwnershipSplit[];

  // ----------------- Contact & Role Info -----------------
  @Prop({ type: String, default: null })
  yourRole?: string;

  @Prop()
image: string;

  @Prop({ type: String, default: null })
  willingToCoBroker?: string;

  @Prop({ type: String, unique: true, sparse: true, default: null })
  listingReferenceNumber?: string;

  @Prop({ type: String, default: null })
  confidentiality?: string;

  @Prop({ type: String, default: '' })
  contactName?: string;

  @Prop({ type: String, default: '' })
  contactPhone?: string;

  @Prop({ type: String, default: '' })
  contactEmail?: string;

  @Prop({ type: String, default: '' })
  contactZipCode?: string;

  @Prop({ type: String, maxlength: 150, default: '' })
  dbaName?: string;

  @Prop({ type: String, maxlength: 150, default: '' })
  legalCompanyName?: string;

  @Prop({ type: String })
  legalIntity?: string;

  @Prop({ type: String, default: '' })
  stateOfFormation?: string;

  @Prop({ type: String, default: '' })
  naicsCode?: string;

  @Prop({ type: Number, default: 0 })
  yearsOwned?: number;

  @Prop({ type: String, default: '' })
  reasonForSelling?: string;

  @Prop({ type: String, default: '' })
  businessAddress?: string;

  // ----------------- Workforce -----------------
  @Prop({ type: String, default: null })
  workforceAllocation?: string;

  @Prop({ type: Number, default: 0 })
  numberOfEmployees?: number;

  @Prop({ type: Number, default: 0 })
  averageTenureInYears?: number;

  @Prop({ type: String, default: '' })
  laborMarket?: string;

  @Prop({ type: String, default: '' })
  workforceOverview?: string;

  @Prop({ type: String, default: '' })
  ownershipInvolvement?: string;

  @Prop({ type: String, default: null })
  managementWillingToStay?: string;

  // ----------------- Industry & Financials -----------------
  @Prop({ type: String, default: null})
  industry: string;

  @Prop({ type: Number, default: 0 })
  revenue: number;

  @Prop({ type: Number, default: 0 })
  askingPrice: number;

  @Prop({ type: Number, default: 0 })
  cashFlow: number;

  @Prop({ default: 'draft' })
  status: string;

  @Prop({ type: Boolean, default: false })
  cimStatus: boolean;

  // @Prop({ type: [AffiliateCompanySchema], default: [] })
  // affiliateCompanies?: AffiliateCompany[];

    @Prop({ type: String, default: null })
  affiliateCompanies?: string;

  @Prop({ type: String, default: null })
  growthOpportunities?: string;

  @Prop({ type: String, default: '' })
  ownerMessage?: string;

  @Prop({ type: String, default: false })
  franchise?: string;

  @Prop({ type: Boolean, default: false })
  isFranchise?: boolean;

  @Prop({ type: Boolean, default: false })
  isRelocatable?: boolean;

  @Prop({ type: Boolean, default: false })
  isStartup?: boolean;

  @Prop({ type: String, default: '' })
  supportAndTraining?: string;

  @Prop({ type: String, default: '' })
  productsAndServices?: string;

  @Prop({ type: String, default: null })
  productRevenueMix?: string;

  @Prop({ type: String, default: '' })
  industryAnalysis?: string;

  @Prop({ type: String, default: '' })
  competitorAnalysis?: string;

  @Prop({ type: String, default: null })
  competitors?: String;

  @Prop({ type: String, default: null })
  customersAndConcentration?: string;

  @Prop({ type: String, default: null })
  marketingAndSalesTactics?: string;

  @Prop({ type: String, default: '' })
  seasonality?: string;

  // ----------------- Key Suppliers -----------------
  @Prop({ type: String, default: null })
  keySuppliers?: string;

  // ----------------- Pending Lawsuits & Liens -----------------
  @Prop({ type: Boolean, default: false })
  pendingLawsuits?: boolean;

  @Prop({ type: String, default: '' })
  pendingLawsuitsDescription?: string;

  @Prop({ type: Boolean, default: false })
  liens?: boolean;

  @Prop({ type: String, default: '' })
  liensDescription?: string;

  // ----------------- Physical Locations & Real Estate -----------------
  @Prop({ type: String, default: null })
  physicalLocations?: string;

  @Prop({ type: String, default: '' })
  facilityAndLocationDetails?: string;

  @Prop({ type: String, default: null })
  propertiesIncluded?: string;

  // ----------------- FF&E -----------------
  @Prop({ type: String, default: '' })
  ffeDescription?: string;

  @Prop({ type: String , default: null })
  ffeAssets?: string;

  // ----------------- Financial Entries -----------------
  @Prop({ type: String, default: null })
  financials?: string;

  @Prop({ type: Number, default: 0 })
  ffEValue?: number;

  @Prop({ type: Number, default: 0 })
  inventoryValue?: number;

  @Prop({ type: String })
  inventoryIncluded?: number;

  @Prop({ type: Number, default: 0 })
  realEstateValue?: number;

  @Prop({ type: String, default: 0 })
  realEstate?: string;

  @Prop({ type: [String], default: [] })
  financialFiles?: string[];



  @Prop({ type: String, default: 0 })
  businessDetails?: string;

  @Prop({ type: String, default: 0 })
  keyHighlights?: string;


  // ----------------- Relations -----------------
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
