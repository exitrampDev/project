import { atom } from "recoil";

export const propertiesState = atom({
  key: "propertiesState",
  default: [
    {
      id: 1,
      title: "Modern Apartment in City Center",
      price: 120000,
      location: "Karachi",
      image: "https://via.placeholder.com/300x200",
    },
    {
      id: 2,
      title: "Luxury Villa with Garden",
      price: 250000,
      location: "Lahore",
      image: "https://via.placeholder.com/300x200",
    },
  ],
});
