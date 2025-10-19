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
import { Toast } from "primereact/toast"; // ✅ Import Toast
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
console.log("res?.data.data>>>>",submissions)


} catch (err) {
      console.error("Error fetching submissions:", err.response?.data || err.message);
    }
  };

  fetchSubmissions();




  }, [id, API_BASE, refreshKey]);

  const docRoomDocDlt = async (fileId) => {
    try {
      const response = await axios.delete(`${API_BASE}/files/${fileId}`);
 
      toast.current.show({
        severity: "success",
        summary: "File Deleted",
        detail: response.data.message || "The file has been removed successfully.",
        life: 3000,
      });

      setFiles((prev) => prev.filter((file) => file._id !== fileId));
    } catch (err) {
      console.error("File Delete Error:", err);
      toast.current.show({
        severity: "error",
        summary: "Delete Failed",
        detail:
          err.response?.data?.message ||
          "Something went wrong while deleting the file.",
        life: 3000,
      });
    }
  };
  //  Upload File
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  console.log("Uploading:", file.type, file.name);
    const formData = new FormData();
  formData.append("file", file);
  formData.append("displayName", displayName || file.name);
  formData.append("typeName", typeName || (file.name.split(".").pop()));

   
  try {
    const res = await axios.post(`${API_BASE}/files/${id}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: res?.data?.message || "File uploaded successfully",
        life: 3000,
      });
       setDisplayName("");
      setTypeName(null);
      setRefreshKey((prev) => prev + 1);

    } catch (err) {
      console.error("Error uploading file:", err);
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: "Could not upload the file",
        life: 3000,
      });
    }
  };
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
      <div
        onClick={() => docRoomDocDlt(rowData._id)}
        className="renderActionDocRoomList_dlt_btn"
      >
        Delete
      </div>
    </div>
  );

const fileAccessControl = (fileAccess, id) => { 

    const handleAccessGrant = () => {
        try{
            const res = axios.patch(`${API_BASE}/nda/allow-doc-room`, { ndaId: id }, {
              headers: {
                    Authorization: `Bearer ${access_token}`,
                },  
            });

             toast.current.show({
                severity: "success",
                summary: "Access Updated",
                detail: res?.data?.message || "Access status updated successfully",
                life: 3000,
            });
setRefreshKey((prev) => prev + 1);
        }catch (err){
            console.error("Error updating access:", err);
            toast.current.show({
                severity: "error",
                summary: "Update Failed",
                detail: err?.response?.data?.message || "Something went wrong",
                life: 3000,
            });

        }



    }

    const handleAccessRevoke = () => {

          try{
            const res = axios.patch(`${API_BASE}/nda/disallow-doc-room`, { ndaId: id }, {
              headers: {
                    Authorization: `Bearer ${access_token}`,
                },  
            });

             toast.current.show({
                severity: "success",
                summary: "Access Updated",
                detail: res?.data?.message || "Access status updated successfully",
                life: 3000,
            });
setRefreshKey((prev) => prev + 1);
        }catch (err){
            console.error("Error updating access:", err);
            toast.current.show({
                severity: "error",
                summary: "Update Failed",
                detail: err?.response?.data?.message || "Something went wrong",
                life: 3000,
            });

        }


    }


     return (
    <>
      {fileAccess === "approved" ? (
        <>
         <div className="fileAccessControl_access" data-id={id} onClick={handleAccessRevoke}>Revoke Access</div>
        </>
      ) : (
        <>
         <div className="fileAccessControl_access"  data-id={id} onClick={handleAccessGrant}>Grant Access</div>
        </>
      )}
    </>
  );
}





const ndaStatusList = (status) => {
  return (
    <>
      {status === "approved" ? (
        <>
         <span className="File_access_cim_sharing_approve"> <i className="pi pi-check text-green-500"></i> Approved</span>
        </>
      ) : (
        <>
          <span className="File_access_cim_sharing_reject"><i className="pi pi-times text-red-500"></i> Not Approved</span>
        </>
      )}
    </>
  );
};


const ndaDocRoomAccesList = (access) => { 
    return (
    <>
      {access === "approved" ? (
        <>
         <span className="File_access_cim_sharing_approve"> <i className="pi pi-check text-green-500"></i> Approved</span>
        </>
      ) : (
        <>
          <span className="File_access_cim_sharing_reject"><i className="pi pi-times text-red-500"></i> Not Approved</span>
        </>
      )}
    </>
  );
}




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
       <label className="p-button p-component cursor-pointer filterBar__mian_list_file_upload_content">
          <i className="pi pi-file mr-2"></i> Upload File <span>(PDF/JPEG/PNG)</span>
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
            accept="*/*"
          />
        </label>
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

      <div className="docRoom_data_table_access_files_wrap">
        <h3 className="docRoom_data_table_access_files_title">File Access Control</h3>
        <div className="my__save_listing_wrap my__listing_table docRoom_data_table">
        <DataTable
          value={submissions}
          className="shadow-sm border-round-lg"
          emptyMessage="No Data found."
        >
           <Column field="businessName" header="Listing Name" />
           <Column field="buyerName"  header="Buyer Name" />
            <Column body={() => { return <><span className="File_access_nda_status"><i className="pi pi-check text-green-500"></i> Signed</span></>}}  header="NDA Status" />
            <Column body={(submissions) => ndaStatusList (submissions.ndaStatus)}  header="CIM Shared" />
           <Column body={(submissions) => ndaDocRoomAccesList (submissions.docRoomAccess)}  header="Doc Room Access" />
           <Column body={(submissions) => fileAccessControl (submissions.docRoomAccess,submissions._id) }  header="Action" />
        </DataTable>
        </div>
       
      </div>
    </div>
  );
};

export default DocumentRoom;
