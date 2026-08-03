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
import DashboardHeader from "./DashboardHeaderBlock";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";



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
        l.listingTitle?.toLowerCase().includes(keyword.toLowerCase()) ||
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
  // const listingNameTemplate = (rowData) => (
  //   <div className="flex items-center gap-2 img_my_save_lisiting">
  //     <img
  //       src={rowData?.image || "https://via.placeholder.com/40"}
  //       alt={rowData?.listingTitle}
  //       className=" rounded"
  //     />
  //     <span>{rowData?.listingTitle}</span>
  //   </div>
  // );
const listingNameTemplate = (rowData) => {
  const title = rowData?.listingTitle || "";
  const words = title.split(" ");
  const truncatedTitle =
    words.length > 7 ? words.slice(0, 7).join(" ") + "..." : title;

  return (
    <div className="flex items-center gap-2 img_my_save_lisiting">
      <img
        src={rowData.image || "https://via.placeholder.com/40"}
        alt={title}
        className=""
      />
      <span>{truncatedTitle}</span>
    </div>
  );
};
const moneyTemplate = (rowData) => {
  return rowData.askingPrice?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

  const actionTemplate = (rowData) => (
    <div className="action__recent_view">
     <Link to={`/user/single-listing/${rowData._id}`} className="flex gap-4">
                  <i
                    className="pi pi-eye cursor-pointer text-blue-500 hover:text-blue-700"
                  ></i>
                  </Link>
      <Button
        icon="pi pi-trash"
        className="button__remove_listing_fav"
        onClick={() => removeFavorite(rowData?._favId)}
        data-pr-tooltip="Remove"
      />
      
    </div>
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
const locationTemplate = (row) =>  row.businessCountry && row.businessState ? `${row.businessCountry}, ${row.businessState}` : "-"; 
const buyerColumns = [
  {
    columnKey: "listingName",
    header: "Listing Name",
    body: listingNameTemplate,
    primary: true,
  },
  {
    columnKey: "ndaStatus",
    header: "NDA Status",
    body: ndaStatusTemplate,
  },
  {
    columnKey: "askingPrice",
    header: "Asking Price",
    body: moneyTemplate,
  },
  {
    columnKey: "viewListing",
    header: "View Listing",
    body: cimTemplate,
  },
  {
    columnKey: "action",
    header: "Action",
    body: actionTemplate,
  },
];

const sellerColumns = [
  {
    columnKey: "listingName",
    header: "Listing Name",
    body: listingNameTemplate,
    primary: true,
  },
  {
    field: "yearStablished",
    header: "Year",
  },
  {
    columnKey: "location",
    header: "Location",
    body: locationTemplate,
  },
  {
    columnKey: "ndaStatus",
    header: "NDA Status",
    body: ndaStatusTemplate,
  },
  {
    columnKey: "savedOn",
    header: "Saved On",
    body: (row) => {
      if (!row?.createdAt) return "-";

      return new Date(row.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    columnKey: "askingPrice",
    header: "Asking Price",
    body: moneyTemplate,
  },
  {
    columnKey: "action",
    header: "Action",
    body: actionTemplate,
  },
];
  return (
    <>

<DashboardHeader headingData="Saved Listing"/>
      {user?.user_type === "buyer_basic"  && ( 
        <>
       <div className="brief__infor_content">Allow users to view listings they have bookmarked. No publishing, editing, or cancellation capabilities are available.</div>
   
          <div className="my__save_listing_wrap">
           
      <ResponsiveDataTable
  value={filteredListings}
  columns={buyerColumns}
  paginator
  rows={10}
  loading={loading}
  emptyMessage={
    error
      ? `Error: ${error}`
      : "No business listings found."
  }
/>
          </div>
   </>
      )}





      {(user?.user_type === "seller_central" || user?.user_type === "seller_broker" || user?.user_type === "seller_individual") && ( 
        <>
      <div className="brief__infor_content">Allow users to view listings they have bookmarked. No publishing, editing, or cancellation capabilities are available.</div>
          <div className="my__save_listing_wrap">
           <ResponsiveDataTable
  value={filteredListings}
  columns={sellerColumns}
  paginator
  rows={10}
  loading={loading}
  emptyMessage={
    error
      ? `Error: ${error}`
      : "No business listings found."
  }
/>
          </div>
   </>
      )}

      {/* Data Table */}
    
    </>
  );
};

export default FavoriteListings;
