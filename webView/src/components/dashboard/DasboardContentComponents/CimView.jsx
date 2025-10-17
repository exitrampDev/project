import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import fileClip from "../../../assets/fileClip.png";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState  } from "../../../recoil/ctaState";
import axios from "axios";

function CIMview() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [listingFiles, setListingFiles] = useState([]);
  const API_BASE = useRecoilValue(apiBaseUrlState);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${API_BASE}/business-listing/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error("Error fetching listing:", err);
      }
    };
    fetchListing();



    const fetchListingfiles = async () => {
      try {
        const response = await axios.get(`${API_BASE}/files/${id}`);
        setListingFiles(response.data);
      } catch (err) {
        console.error("Error fetching listing:", err);
      }
    };
    fetchListingfiles();



  }, [id]);

  if (!listing) return <p>Loading...</p>;

  return (
    <div className="cim__view_main_container">
     <div className="dashboard__header_block">
                  <h3 className="heading__Digital_CIM">
                    {" "}
                    Confidential Information Memorandum
                  </h3>
    
                  <div className="dashboard__header_search_notification_wrap">
                    <div className="dashboard__search_field_wrap">
                      <input type="text" placeholder="Search" />
                      <img src={serachIcon} alt="" />
                    </div>
                    <div className="dashboard__notification_wrap">
                      <button>
                        <img src={notifInfo} alt="" />
                      </button>
                    </div>
                    <div className="dashboard__user_wrap">
                      <button>
                        <img src={userImg} alt="" />
                      </button>
                    </div>
                  </div>
                </div>
    
                <div className="brief__infor_content">
                  <p>
                    This information is used to generate your Confidential Information Memorandum (CIM) and prepare your business for buyer review.
                  </p>
                </div>
    <div className="cim__view_main_block_wrap">
      
      {/* Business Overview */}
      <div className="cim__view_main_card">
        <h2 className="heading__card_cim">CIM Basics</h2>
        <div className="list__card_cim_row"><span>Listing ID:</span> {listing._id}</div>
        <div className="list__card_cim_row"><span>Listing Title:</span> {listing.listingTitle}</div>
        <div className="list__card_cim_row listing__description_cim"><span>Listing Description:</span> {listing.listingDescription}</div>
        <div className="list__card_cim_row"><span>Asking Price:</span> {listing.askingPrice}</div>
        <div className="list__card_cim_row">
          <span>Industries:</span>
          <ul className="list__card_cim_row_sub_list">
            {listing.industry &&
              JSON.parse(listing.industry).map((ind, idx) => (
                <li key={idx}>{ind}</li>
              ))}
          </ul>
        </div>
       <div className="list__card_cim_row"><span>Role:</span> {listing.yourRole}</div>
      <div className="list__card_cim_row"><span>Willing To Co-Broker:</span> {listing.willingToCoBroker}</div>
      <div className="list__card_cim_row"><span>Contact Name:</span> {listing.contactName}</div>
      <div className="list__card_cim_row"><span>Phone:</span> {listing.contactPhone}</div>
      <div className="list__card_cim_row"><span>Email:</span> {listing.contactEmail}</div>
      <div className="list__card_cim_row"><span>Zip Code:</span> {listing.contactZipCode}</div>
       
      </div>

      {/* Location Details */}
      <div className="cim__view_main_card">
        <h2 className="heading__card_cim">Executive Summary</h2>
        <div className="list__card_cim_row">
    <span>DBA Name:</span> {listing.dbaName}
  </div>

  <div className="list__card_cim_row">
    <span>Legal Company Name:</span> {listing.legalCompanyName}
  </div>

  <div className="list__card_cim_row">
    <span>Entity Type:</span> {listing.entityType}
  </div>

  <div className="list__card_cim_row">
    <span>State of Formation:</span> {listing.stateOfFormation}
  </div>

  <div className="list__card_cim_row">
    <span>NAICS Code:</span> {listing.naicsCode}
  </div>

  <div className="list__card_cim_row">
    <span>Founding Year:</span> {listing.yearStablished}
  </div>

  <div className="list__card_cim_row">
    <span>Years Owned:</span> {listing.yearsOwned}
  </div>

  <div className="list__card_cim_row">
    <span>Reason for Selling:</span> {listing.reasonForSelling}
  </div>

  {/* Company Logo - only render if available */}
  {listing.companyLogo && (
    <div className="list__card_cim_row">
      <span>Company Logo:</span>
      <img src={listing.companyLogo} alt="Company Logo" className="h-12 ml-2" />
    </div>
  )}

  <div className="list__card_cim_row">
    <span>Business Address:</span> {listing.businessAddress}
  </div>

  {/* Ownership Split - array */}
  {listing.ownershipSplit?.length > 0 && (
    <div className="list__card_cim_row">
      <span>Ownership Split:</span>
      <ul className="ml-2">
        {listing.ownershipSplit.map((os, idx) => (
          <li key={idx}>{JSON.stringify(os)}</li>
        ))}
      </ul>
    </div>
  )}

  {/* Affiliate Companies - JSON string */}
  {listing.affiliateCompanies && (
    <div className="list__card_cim_row">
      <span>Affiliate Companies:</span>
      <ul className="list__card_cim_row_sub_list">
        {Object.entries(JSON.parse(listing.affiliateCompanies)).map(([k, v]) => (
          <li key={k}><strong>{k}:</strong> {v}</li>
        ))}
      </ul>
    </div>
  )}

  {/* Key Highlights - JSON string (array) */}
  {listing.keyHighlights && (
    <div className="list__card_cim_row">
      <span>Key Highlights:</span>
      <ul className="list__card_cim_row_sub_list">
        {JSON.parse(listing.keyHighlights).map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )}

  {/* Growth Opportunities - JSON string (array) */}
  {listing.growthOpportunities && (
    <div className="list__card_cim_row">
      <span>Growth Opportunities:</span>
      <ul className="list__card_cim_row_sub_list">
        {JSON.parse(listing.growthOpportunities).map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )}

  <div className="list__card_cim_row">
    <span>Message from Owner:</span> {listing.ownerMessage}
  </div>

  <div className="list__card_cim_row">
    <span>Franchise:</span> {listing.isFranchise ? "Yes" : "No"}
  </div>

  <div className="list__card_cim_row">
    <span>Relocatable:</span> {listing.isRelocatable ? "Yes" : "No"}
  </div>

  <div className="list__card_cim_row">
    <span>Startup:</span> {listing.isStartup ? "Yes" : "No"}
  </div>

  <div className="list__card_cim_row">
    <span>Support and Training:</span> {listing.supportAndTraining}
  </div>

  <div className="list__card_cim_row">
    <span>Products and Services:</span> {listing.productsAndServices}
  </div>

  {/* Product Revenue Mix - JSON string (array of objects) */}
  {listing.productRevenueMix && (
    <div className="list__card_cim_row">
      <span>Product Revenue Mix:</span>
      <ul className="list__card_cim_row_sub_list">
        {JSON.parse(listing.productRevenueMix).map((item, idx) => (
          <li key={idx}>
            {item.productLine} - {item.percentage}%
          </li>
        ))}
      </ul>
    </div>
  )}

      </div>

      {/* Operational Details */}
      <div className="cim__view_main_card">
        <h2 className="heading__card_cim">Industry Competitors and Customers</h2>
        
         <div className="list__card_cim_row">
    <span>Industry Analysis:</span> {listing.industryAnalysis}
  </div>

  <div className="list__card_cim_row">
    <span>Competitor Analysis:</span> {listing.competitorAnalysis}
  </div>

  {/* Competitors - JSON string (array of objects) */}
  {listing.competitors && (
    <div className="list__card_cim_row">
      <span>Competitors:</span>
      <ul className="list__card_cim_row_sub_list">
        {JSON.parse(listing.competitors).map((comp, idx) => (
          <li key={idx}>
            <b>{comp.name}</b> – {comp.description}
          </li>
        ))}
      </ul>
    </div>
  )}

  {/* Customers and Concentration - JSON string (array of objects) */}
  {listing.customersAndConcentration && (
    <div className="list__card_cim_row">
      <span>Customers & Concentration:</span>
      <ul className="list__card_cim_row_sub_list">
        {JSON.parse(listing.customersAndConcentration).map((cust, idx) => (
          <li key={idx}>
            <b>{cust.customer}</b> – {cust.percentage}%
          </li>
        ))}
      </ul>
    </div>
  )}

  {/* Marketing & Sales Tactics - JSON string (array) */}
  {listing.marketingAndSalesTactics && (
    <div className="list__card_cim_row">
      <span>Marketing & Sales Tactics:</span>
      <ul className="list__card_cim_row_sub_list">
        {JSON.parse(listing.marketingAndSalesTactics).map((tactic, idx) => (
          <li key={idx}>{tactic}</li>
        ))}
      </ul>
    </div>
  )}

  <div className="list__card_cim_row">
    <span>Seasonality:</span> {listing.seasonality}
  </div>
      </div>

      {/* Operations */} 
      <div className="cim__view_main_card">
        <h2 className="heading__card_cim">Operations</h2>
       <div className="list__card_cim_row">
  <span>Workforce Overview:</span> {listing.workforceOverview}
</div>

<div className="list__card_cim_row">
  <span>Ownership Involvement:</span> {listing.ownershipInvolvement}
</div>

<div className="list__card_cim_row">
  <span>Management Willing to Stay:</span> {listing.managementWillingToStay}
</div>

<div className="list__card_cim_row">
  <span>Number of Employees:</span> {listing.numOfEmployees}
</div>

<div className="list__card_cim_row">
  <span>Average Tenure in Years:</span> {listing.averageTenureInYears}
</div>

<div className="list__card_cim_row">
  <span>Labor Market:</span> {listing.laborMarket}
</div>

<div className="list__card_cim_row">
  <span>Workforce Allocation:</span> {listing.workforceAllocation}
</div>

<div className="list__card_cim_row">
  <span>Key Suppliers:</span> 
 <ul className="list__card_cim_row_sub_list">
   {(() => {
    try {
      const supplier = JSON.parse(listing.keySuppliers);
      return (<>
      <li><strong>Vender</strong> {supplier.vendorName}</li>
      <li><strong>Description</strong> {supplier.description}</li> 
      </>) 
    } catch (e) {
      return listing.keySuppliers; 
    }
  })()}
 </ul>
</div>

<div className="list__card_cim_row">
  <span>Pending Lawsuits:</span> {listing.pendingLawsuitsDescription}
</div>

<div className="list__card_cim_row">
  <span>Liens:</span> {listing.liensDescription}
</div>

      </div>

      {/* Facility and Location */}
      <div className="cim__view_main_card">
        <h2 className="heading__card_cim">Facility and Location</h2>
        <div className="list__card_cim_row">
  <span>Physical Locations:</span> {listing.physicalLocations }
</div>

<div className="list__card_cim_row">
  <span>Facility and Location Details:</span> {listing.facilityAndLocationDetails}
</div>

<div className="list__card_cim_row">
  <span>Real Estate Ownership:</span> {listing.realEstateValue}
</div>

<div className="list__card_cim_row">
  <span>Property Included:</span> 
  
  <ul className="list__card_cim_row_sub_list">
    {(() => {
      let props = listing.propertiesIncluded;
      if (typeof props === "string") {
        try {
          props = JSON.parse(props);
        } catch (e) {
          return <li>{props}</li>;
        }
      }
      return props?.map((prop, index) => (
        <>
          <li key={index}>Location Type: {prop.locationType}</li>
          <li>Description: {prop.usageDescription}</li>
          <li>Ownership: {prop.ownership}</li>
          <li>Include In Sale: {prop.includedInSale}</li>
        </>
      ));
    })()}
  </ul>
</div>

<div className="list__card_cim_row">
  <span>FF&amp;E Description:</span> {listing.ffeDescription}
</div>

<div className="list__card_cim_row">
  <span>FF&amp;E Asset List:</span> {listing.ffeAssetList}

  <ul className="list__card_cim_row_sub_list">
    {(() => {
      let propsAssets = listing.ffeAssets;
      if (typeof propsAssets === "string") {
        try {
          propsAssets = JSON.parse(propsAssets);
        } catch (e) {
          return <li>{propsAssets}</li>;
        }
      }
      return propsAssets?.map((prop, index) => (
        <>
          <li key={index}>Assets Type: {prop.assetType}</li>
          <li>Include State: {prop.includedStatus}</li>
          <li>Assets Description: {prop.assetDescription}</li>
          <li>Estimated Value: {prop.estimatedValue}</li>
        </>
      ));
    })()}
  </ul>
</div>

      </div>



 <div className="cim__view_main_card">
        <h2 className="heading__card_cim">Financials</h2>
  <div className="list__card_cim_row">
  <span>Annual Revenue:</span> {listing.revenue}
</div>

<div className="list__card_cim_row">
  <span>EBITA:</span> {listing.ebita}
</div>

<div className="list__card_cim_row">
  <span>SDE:</span> {listing.sde}
</div>

<div className="list__card_cim_row">
  <span>Cash Flow:</span> {listing.cashFlow}
</div>

<div className="list__card_cim_row">
  <span>Net Profit:</span> {listing.netProfit}
</div>

<div className="list__card_cim_row">
  <span>Add Backs:</span> {listing.addBacks}
</div>

<div className="list__card_cim_row">
  <span>FF&amp;E Value:</span> {listing.ffEValue}
</div>

<div className="list__card_cim_row">
  <span>Inventory Value:</span> {listing.inventoryValue}
</div>

<div className="list__card_cim_row">
  <span>Real Estate Value:</span> {listing.realEstateValue}
</div>

  
        </div>

      {/* Attached Files */}
      <div className="cim__view_main_card">
        <h2 className="heading__card_cim">Attached Files</h2>
        {listingFiles && listingFiles.map((file,index) => (
           <div className="icon__file_cim" key={index}>
          <a href={`${API_BASE}${file.url}`}  target="_blank" rel="noopener noreferrer">
            {file.displayName}
          </a>
        </div>
        ))}
        </div>

    
    </div>
    </div>
  );
}

export default CIMview;
