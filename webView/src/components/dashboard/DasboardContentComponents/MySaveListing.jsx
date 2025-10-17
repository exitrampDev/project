import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState  } from "../../../recoil/ctaState";
import serachIcon from "../../../assets/serachIcon.png";
import notifInfo from "../../../assets/notifInfo.png";
import userImg from "../../../assets/userImg.png";
import { Link } from "react-router-dom";



const FavoriteListings = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [listingType, setListingType] = useState(null); // Seller / M&A
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState(null);
  const [region, setRegion] = useState(null);
  const [ndaStatus, setNdaStatus] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 100000000000000000000000000000]);
  const [cashFlowRange, setCashFlowRange] = useState([0, 50000000000000000000000000]);

  // Fetch Favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_BASE}/favorite`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch favorites");
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const mapped = result.data.map((fav) => ({
            ...fav.businessId,
            _favId: fav._id,
          }));
          setListings(mapped);
          setFilteredListings(mapped);
        } else {
          setListings([]);
          setFilteredListings([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (access_token) fetchFavorites();
  }, [access_token]);

  // Remove favorite
  const removeFavorite = async (favId) => {
    try {
      const res = await fetch(`${API_BASE}/favorite/${favId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
      setListings((prev) => prev.filter((item) => item._favId !== favId));
      setFilteredListings((prev) => prev.filter((item) => item._favId !== favId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  // Filter logic
  useEffect(() => {
    let filtered = [...listings];

    if (listingType) filtered = filtered.filter(l => l.listingType === listingType);
    if (keyword)
      filtered = filtered.filter(l =>
        l.businessName?.toLowerCase().includes(keyword.toLowerCase()) ||
        l.businessType?.toLowerCase().includes(keyword.toLowerCase())
      );
    if (industry) filtered = filtered.filter(l => l.businessType === industry);
    if (region) filtered = filtered.filter(l => l.state === region);
    if (ndaStatus) filtered = filtered.filter(l => l.ndaStatus === ndaStatus);
    filtered = filtered.filter(
      l => (l.askingPrice || 0) >= priceRange[0] && (l.askingPrice || 0) <= priceRange[1]
    );
    filtered = filtered.filter(
      l => (l.cashFlow || 0) >= cashFlowRange[0] && (l.cashFlow || 0) <= cashFlowRange[1]
    );

    setFilteredListings(filtered);
  }, [listingType, keyword, industry, ndaStatus, priceRange, cashFlowRange, listings]);

  // Templates
  const listingNameTemplate = (rowData) => (
    <div className="flex items-center gap-2 img_my_save_lisiting">
      <img
        src={rowData?.image || "https://via.placeholder.com/40"}
        alt={rowData?.businessName}
        className=" rounded"
      />
      <span>{rowData?.businessName}</span>
    </div>
  );


  const actionTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-trash"
        className="button__remove_listing_fav"
        onClick={() => removeFavorite(rowData?._favId)}
        data-pr-tooltip="Remove"
      />
      
    </>
  );
const cimTemplate = (rowData) => (
  <>
    <Tooltip target=".button__remove_listing_fav" position="top" />
    <Link to={`/user/single-listing/${rowData?._id}`} className="flex gap-4">
      View
    </Link>
  </>
);
   const ndaStatusTemplate = () => <><div className="class__nda_not_started">Not Started</div></>;

  const saveIndustryTemplate = (indusValue) => (JSON.parse(Object(indusValue?.industry)))
  
  return (
    <>


    <div className="dashboard__header_block">
            <h3 className="heading__Digital_CIM">Saved Listing</h3>
    
            <div className="dashboard__header_search_notification_wrap">
              <div className="dashboard__search_field_wrap">
                <input type="text" placeholder="Search" />
                <img src={serachIcon} alt="search" />
              </div>
              <div className="dashboard__notification_wrap">
                <button>
                  <img src={notifInfo} alt="notifications" />
                </button>
              </div>
              <div className="dashboard__user_wrap">
                <button>
                  <img src={userImg} alt="user" />
                </button>
              </div>
            </div>
          </div>
      {user?.user_type === "buyer"  && ( 
        <>
      <div className="save__listing_filter_wrap">
        <Dropdown
          value={listingType}
          options={["Seller Listing", "M&A Listing"]}
          placeholder="Listing Type"
          onChange={(e) => setListingType(e.value)}
        />
        <InputText
          placeholder="Search by keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ minWidth: "30%" }}
        />
        <Dropdown
          value={industry}
          options={[...new Set(listings?.map((l) => l.businessType))]}
          placeholder="Industry"
          onChange={(e) => setIndustry(e.value)}
        />
        <Dropdown
          value={ndaStatus}
          options={["Approved", "Submitted","Not Started"]}
          placeholder="NDA Status"
          onChange={(e) => setNdaStatus(e.value)}
        />
          <Dropdown
            value={priceRange}
            options={[
              { label: "All Prices", value: [0, Infinity] },
              { label: "Under $100K", value: [0, 100000] },
              { label: "$100K – $500K", value: [100000, 500000] },
              { label: "$500K – $1M", value: [500000, 1000000] },
              { label: "$1M – $5M", value: [1000000, 5000000] },
              { label: "Over $5M", value: [5000000, Infinity] },
            ]}
            placeholder="Asking Price Range"
            onChange={(e) => setPriceRange(e.value)}
          />

          <Dropdown
            value={cashFlowRange}
            options={[
              { label: "All Cash Flows", value: [0, Infinity] },
              { label: "Under $100K", value: [0, 100000] },
              { label: "$100K – $500K", value: [100000, 500000] },
              { label: "Over $500K", value: [500000, Infinity] },
            ]}
            placeholder="Cash Flow Range"
            onChange={(e) => setCashFlowRange(e.value)}
            
          />
      </div>
          <div className="my__save_listing_wrap">
           <DataTable
        value={filteredListings}
        paginator
        rows={10}
        loading={loading}
        responsiveLayout="scroll"
        emptyMessage={error ? `Error: ${error}` : "No business listings found."}
      >
        <Column header="Listing Name" body={listingNameTemplate} />
        <Column header="Industry" body={saveIndustryTemplate}/>
        <Column header="NDA Status" body={ndaStatusTemplate} />
        <Column field="entityType" header="Type" />
        <Column field="revenue" header="Revenue" />
        <Column field="askingPrice" header="Asking Price" />
        <Column header="View Listing" body={cimTemplate} />
        <Column header="Action" body={actionTemplate} />
      </DataTable>
          </div>
   </>
      )}





      {user?.user_type === "seller"  && ( 
        <>
      <div className="brief__infor_content">Allow users to view listings they have bookmarked. No publishing, editing, or cancellation capabilities are available.</div>
          <div className="my__save_listing_wrap">
           <DataTable
        value={filteredListings}
        paginator
        rows={10}
        loading={loading}
        responsiveLayout="scroll"
        emptyMessage={error ? `Error: ${error}` : "No business listings found."}
      >
        <Column header="Listing Name" body={saveIndustryTemplate}/>
        <Column field="entityType" header="Type" />
        <Column header="Region" field="state" />
        <Column header="Industry" body={saveIndustryTemplate} />
        <Column header="NDA Status" body={ndaStatusTemplate} />
       <Column
          header="Saved On"
          body={(row) => {
            const date = new Date(row?.createdAt);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }}
        />

        <Column field="revenue" header="Revenue" />
        <Column field="askingPrice" header="Asking Price" />
        <Column header="Action" body={(row)=> (<><Link to={`/user/single-listing/${row?._id}`} className="flex gap-4">View Listing</Link></>)} />
      </DataTable>
          </div>
   </>
      )}

      {/* Data Table */}
      
    </>
  );
};

export default FavoriteListings;
