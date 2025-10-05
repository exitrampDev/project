import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import serachIcon from "../../../assets/serachIcon.png";
import notifInfo from "../../../assets/notifInfo.png";
import userImg from "../../../assets/userImg.png";
import { authState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";
import { Tooltip } from "primereact/tooltip";

const RecentViewListing = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("http://localhost:3000/recently", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const result = await response.json();

        if (result && Array.isArray(result.data)) {
          // flatten so DataTable works directly with business info
          const mapped = result.data.map((fav) => ({
            ...fav.businessId,
            _favId: fav._id, // keep reference to favorite record
          }));
          setListings(mapped);
        } else {
          setListings([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (access_token) {
      fetchFavorites();
    }
  }, [access_token]);
  const removeFavorite = async (favId) => {
    try {
      const res = await fetch(`http://localhost:3000/recently/${favId}`, {
        method: "DELETE", // as per your API requirement
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove favorite");
      }

      // Optimistically update UI
      setListings((prev) => prev.filter((item) => item._favId !== favId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };
  // templates
  const listingNameTemplate = (rowData) => (
    <div className="flex items-center gap-2 img_my_save_lisiting">
      <img
        src={rowData.image || "https://via.placeholder.com/40"}
        alt={rowData.businessName}
        className="w-10 h-10 rounded"
      />
      <span>{rowData.businessName}</span>
    </div>
  );
  const industryTemplate = (rowData) => rowData.businessType || "—";
  const ndaStatusTemplate = () => "Pending"; // placeholder, adjust if API returns NDA info
  const cimTemplate = () => <button className="cim-btn">View CIM</button>;
  const actionTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-heart-fill"
        className="button__remove_listing_fav"
        onClick={() => removeFavorite(rowData._favId)}
        data-pr-tooltip="Remove" // tooltip text
      />
      <Tooltip target=".button__remove_listing_fav" position="top" />
    </>
  );
  const moneyTemplate = (value) =>
    value ? `$${Number(value).toLocaleString()}` : "—";

  return (
    <>
      <div className="dashboard__header_block">
        <h3 className="heading__Digital_CIM">Recent View</h3>

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

      <div className="my__save_listing_wrap">
        <DataTable
          value={listings}
          paginator
          rows={10}
          loading={loading}
          responsiveLayout="scroll"
          emptyMessage={
            error ? `Error: ${error}` : "No business listings found."
          }
        >
          <Column header="Listing Name" body={listingNameTemplate} />
          <Column header="Industry" body={industryTemplate} />
          <Column header="NDA Status" body={ndaStatusTemplate} />
          <Column field="entityType" header="Type" />
          <Column
            field="revenue"
            header="Revenue"
            body={(rowData) => moneyTemplate(rowData.revenue)}
          />
          <Column
            field="askingPrice"
            header="Asking Price"
            body={(rowData) => moneyTemplate(rowData.askingPrice)}
          />
          <Column header="CIM Access" body={cimTemplate} />
          <Column header="Action" body={actionTemplate} />
        </DataTable>
      </div>
    </>
  );
};

export default RecentViewListing;
