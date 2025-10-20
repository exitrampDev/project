import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast"; 
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";


const DocumentRoom = () => {
  const { id } = useParams();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState(null);
  const [uploadedOn, setUploadedOn] = useState(null);
  const [size, setSize] = useState(null);
  const [listingData, setListingData] = useState([]);
  const toast = useRef(null); 
  const [displayName, setDisplayName] = useState("");
  const [typeName, setTypeName] = useState(null);
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const [refreshKey, setRefreshKey] = useState(0);
  const [submissions, setSubmissions] = useState([]);

  const categoryOptions = [
    { label: "Financials", value: "Financials" },
    { label: "Operations", value: "Operations" },
    { label: "Legal", value: "Legal" },
  ];

  const uploadedOnOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
  ];

  const sizeOptions = [
    { label: "Small (<1MB)", value: "small" },
    { label: "Medium (1MB-5MB)", value: "medium" },
    { label: "Large (>5MB)", value: "large" },
  ];

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API_BASE}/files/${id}`);
        setFiles(res.data || []);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    const listingDataReq = async () => {
      try {
        const response = await axios.get(`${API_BASE}/business-listing/${id}`);
        setListingData(response?.data);
      } catch (err) {
        console.error("listing Not Find", err);
      }
    };

    fetchFiles();
    listingDataReq();


const fetchSubmissions = async () => {
    try {
      if (!access_token) {
        console.warn("No access token found.");
        return;
      }

      const res = await axios.get(`${API_BASE}/nda/owner-submissions`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      setSubmissions(res?.data.data);
    } catch (err) {
        console.error("Error fetching submissions:", err.response?.data || err.message);
        }
    };

  fetchSubmissions();

  }, [id, API_BASE, refreshKey]);


  const renderActions = (rowData) => (
    <div className="renderActionDocRoomList">
      <a
        href={`${API_BASE}${rowData.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="renderActionDocRoomList__anchor"
      >
        Preview
      </a>
    </div>
  );





  return (
    <div className="dashboard__header">
      {/* Toast Component */}
      <Toast ref={toast} position="top-right" />

      <div className="dashboard__header_block">
        <h3>Document Room | {listingData.businessName}</h3>

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
          Securely Manage And Share Files With Buyers Who Have Been Approved To
          Access Your CIM. All Access Is Logged And Controlled By You.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filterBar__mian_list_wrap">
        <div className="filterBar__mian_list_filter_col">
            <span className="filterBar__mian_list_search">
          <i className="pi pi-search" />
          <InputText placeholder="Search by Name" />
        </span>
        <Dropdown
          value={category}
          options={categoryOptions}
          onChange={(e) => setCategory(e.value)}
          placeholder="Category"
        />
        <Dropdown
          value={uploadedOn}
          options={uploadedOnOptions}
          onChange={(e) => setUploadedOn(e.value)}
          placeholder="Uploaded On"
        />
        <Dropdown
          value={size}
          options={sizeOptions}
          onChange={(e) => setSize(e.value)}
          placeholder="Size"
        />
        </div>
      </div>

      {/* Document Table */}
      <div className="my__save_listing_wrap my__listing_table docRoom_data_table">
        <DataTable
          value={files}
          className="shadow-sm border-round-lg"
          emptyMessage="No files found."
        >
          <Column field="displayName" header="File Name" />
          <Column
            header="Listing"
            body={() => <span>{listingData.businessName}</span>}
          />
          <Column
            field="mimetype"
            header="Category"
            body={(rowData) => rowData.mimetype.split("/")[1].toUpperCase()}
          />
          <Column
            field="createdAt"
            header="Uploaded On"
            body={(rowData) =>
              new Date(rowData.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <Column
            field="size"
            header="Size"
            body={(rowData) => `${(rowData.size / 1024).toFixed(1)} KB`}
          />
          <Column header="Actions" body={renderActions} />
        </DataTable>
      </div>

    </div>
  );
};

export default DocumentRoom;
