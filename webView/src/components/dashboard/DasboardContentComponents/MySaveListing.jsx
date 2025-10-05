import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { useRecoilValue } from "recoil";
import { authState } from "../../../recoil/ctaState";
import serachIcon from "../../../assets/serachIcon.png";
import notifInfo from "../../../assets/notifInfo.png";
import userImg from "../../../assets/userImg.png";
import { Link } from "react-router-dom";


const FavoriteListings = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
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
        const response = await fetch("/api/favorite", {
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
      const res = await fetch(`/api/favorite/${favId}`, {
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
        src={rowData.image || "https://via.placeholder.com/40"}
        alt={rowData.businessName}
        className=" rounded"
      />
      <span>{rowData.businessName}</span>
    </div>
  );
  const moneyTemplate = (value) => (value ? `$${Number(value).toLocaleString()}` : "—");

  const actionTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-heart-fill"
        className="button__remove_listing_fav"
        onClick={() => removeFavorite(rowData._favId)}
        data-pr-tooltip="Remove"
      />
      <Tooltip target=".button__remove_listing_fav" position="top" />
    </>
  );
 const cimTemplate = () => <button className="cim-btn">View CIM</button>;
   const ndaStatusTemplate = () => <><div className="class__nda_not_started">Not Started</div></>;
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
      <div className="flex gap-4 mb-4">
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
        />
        <Dropdown
          value={industry}
          options={[...new Set(listings.map((l) => l.businessType))]}
          placeholder="Industry"
          onChange={(e) => setIndustry(e.value)}
        />
        <Dropdown
          value={ndaStatus}
          options={["Approved", "Submitted","Not Started"]}
          placeholder="NDA Status"
          onChange={(e) => setNdaStatus(e.value)}
        />
        <div>
          <span>Asking Price:</span>
          <Slider
            value={priceRange}
            onChange={(e) => setPriceRange(e.value)}
            range
            min={0}
            max={1000000}
          />
        </div>
        <div>
          <span>Cash Flow:</span>
          <Slider
            value={cashFlowRange}
            onChange={(e) => setCashFlowRange(e.value)}
            range
            min={0}
            max={500000}
          />
        </div>
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
        <Column header="Industry" field="businessType" />
        <Column header="NDA Status" body={ndaStatusTemplate} />
        <Column field="entityType" header="Type" />
        <Column field="revenue" header="Revenue" body={(row) => moneyTemplate(row.revenue)} />
        <Column field="askingPrice" header="Asking Price" body={(row) => moneyTemplate(row.askingPrice)} />
        <Column header="CIM Access" body={cimTemplate} />
        <Column header="Action" body={actionTemplate} />
      </DataTable>
          </div>
   </>
      )}





      {user?.user_type === "seller"  && ( 
        <>
      <div className="flex gap-4 mb-4">
        <InputText
          placeholder="Search by keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Dropdown
          value={listingType}
          options={["Seller Listing", "M&A Listing"]}
          placeholder="Type"
          onChange={(e) => setListingType(e.value)}
        />
        <Dropdown
          value={industry}
          options={[...new Set(listings.map((l) => l.businessType))]}
          placeholder="Industry"
          onChange={(e) => setIndustry(e.value)}
        />
        <Dropdown
          value={region}
          options={[...new Set(listings.map((l) => l.state))]}
          placeholder="Region"
          onChange={(e) => setRegion(e.value)}
        />
        <Dropdown
          value={ndaStatus}
          options={["Approved", "Submitted","Not Started"]}
          placeholder="NDA Status"
          onChange={(e) => setNdaStatus(e.value)}
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
        <Column header="Listing Name" field="businessName" />
        <Column field="entityType" header="Type" />
        <Column header="Region" field="state" />
        <Column header="Industry" field="businessType" />
        <Column header="NDA Status" body={ndaStatusTemplate} />
       <Column
          header="Saved On"
          body={(row) => {
            const date = new Date(row.createdAt);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }}
        />

        <Column field="revenue" header="Revenue" body={(row) => moneyTemplate(row.revenue)} />
        <Column field="askingPrice" header="Asking Price" body={(row) => moneyTemplate(row.askingPrice)} />
        <Column header="Action" body={(row)=> (<><Link to={`user/listing/${row._id}`} className="flex gap-4">View Listing</Link></>)} />
      </DataTable>
          </div>
   </>
      )}

      {/* Data Table */}
      
    </>
  );
};

export default FavoriteListings;
