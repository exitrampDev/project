import React from "react";
import featureImg from "../../assets/featureImg.png";
import ndaIcon from "../../assets/ndaIcon.png";
import metricIcon from "../../assets/metricIcon.png";
import filterIcon from "../../assets/filterIcon.png";
import notificationIcon from "../../assets/notificationIcon.png";
import docsRoom from "../../assets/docsRoom.png";

export default function PlatformFeature() {
  return (
    <>
      <div className="platformFeature__wrapper">
        <div className="platformFeature__container">
          <div className="platformFeature__content_box">
            <h3>Platform Features</h3>
            <div className="platformFeature__content_box_area">
              <div className="platformFeature__content_box_area_list">
                <div className="platformFeature__content_box_area_image">
                  <img src={ndaIcon} alt="-" />
                </div>
                <div className="platformFeature__content_box_area_text">
                  <h3>NDA & CIM Management</h3>
                  <p>Sign, track, and manage confidentiality workflows.</p>
                </div>
              </div>
              <div className="platformFeature__content_box_area_list">
                <div className="platformFeature__content_box_area_image">
                  <img src={metricIcon} alt="-" />
                </div>
                <div className="platformFeature__content_box_area_text">
                  <h3>Listing Metrics</h3>
                  <p>Track buyer interest and engagement.</p>
                </div>
              </div>
              <div className="platformFeature__content_box_area_list">
                <div className="platformFeature__content_box_area_image">
                  <img src={filterIcon} alt="-" />
                </div>
                <div className="platformFeature__content_box_area_text">
                  <h3>Filtered Search</h3>
                  <p>Search listings by industry, location, and size.</p>
                </div>
              </div>
              <div className="platformFeature__content_box_area_list">
                <div className="platformFeature__content_box_area_image">
                  <img src={notificationIcon} alt="-" />
                </div>
                <div className="platformFeature__content_box_area_text">
                  <h3>Smart Notifications</h3>
                  <p>Stay informed when key actions happen.</p>
                </div>
              </div>
              <div className="platformFeature__content_box_area_list">
                <div className="platformFeature__content_box_area_image">
                  <img src={docsRoom} alt="-" />
                </div>
                <div className="platformFeature__content_box_area_text">
                  <h3>Secure Document Rooms</h3>
                  <p>Sellers control who sees what, and when.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="platformFeature__image_box">
            <img src={featureImg} alt="-" />
          </div>
        </div>
      </div>
    </>
  );
}
