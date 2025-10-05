import React from "react";

const PropertyCard = ({ property }) => {
  return (
    <div
      style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}
    >
      <img
        src={property.image}
        alt={property.title}
        style={{ width: "100%", height: "180px", objectFit: "cover" }}
      />
      <h3>{property.title}</h3>
      <p>{property.location}</p>
      <p>
        <strong>${property.price.toLocaleString()}</strong>
      </p>
    </div>
  );
};

export default PropertyCard;
