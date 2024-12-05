import { countrySummary } from "../lib/countrySummary";

export const config = {
  style: "mapbox://styles/jadedeo/cm40cifbq00j101qr1z6hh9wb",
  accessToken:
    "pk.eyJ1IjoiamFkZWRlbyIsImEiOiJjbTJuZzFpYWkwNTdhMmlvbW16bmt3bjlhIn0.QCsOvTO9JomVioOyAgZgPA",
  showMarkers: false,
  markerColor: "#E54F6D",
  //projection: 'equirectangular',
  //Read more about available projections here
  //https://docs.mapbox.com/mapbox-gl-js/example/projections/
  inset: true,
  insetOptions: {
    markerColor: "orange",
  },
  insetPosition: "bottom-right",
  theme: "light",
  use3dTerrain: false, //set true for enabling 3D maps.
  auto: false,
  title: "Your Title Goes Here",
  subtitle:
    "The Storytelling Template helps you create an awesome animated map story with ease.",
  byline: "By a I.M. Amapper",
  footer:
    'Source: source citations, etc. <br> Created using <a href="https://github.com/mapbox/storytelling" target="_blank">Mapbox Storytelling</a> template.',
  chapters: [
    {
      id: "slug-style-id",
      alignment: "left",
      hidden: false,
      title: "The Subcontinent",
      description:
        "South Asian indentureship took place during the time of the British Raj, before the formation of modern-day countries such as India, Pakistan, and Bangladesh.",
      location: {
        center: [78.14475, 21.69509],
        zoom: 3,
        pitch: 0,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "britishraj-cf12ij",
          opacity: 1,
          duration: 500,
        },
        { layer: "indiaports-9jzlwj", opacity: 0 },
      ],
      onChapterExit: [
        {
          layer: "britishraj-cf12ij",
          opacity: 0,
        },
      ],
    },
    {
      id: "second-identifier",
      alignment: "left",
      hidden: false,
      title: "Ports of Departure",
      description:
        "<span>Ships carrying laborers to the colonies departed from either Madras (now Chennai), Tamil Nadu or Kolkata, West Bengal.</span><span>Though there are others, the following countries received some of the most sizable poplations of 'indentured Indians'.</span>",
      location: {
        center: [78.14475, 21.69509],
        zoom: 3,
        pitch: 0,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "indiaports-9jzlwj", opacity: 1, duration: 500 },
        { layer: "fiji-7fwess", opacity: 0 },
      ],
      onChapterExit: [{ layer: "indiaports-9jzlwj", opacity: 0 }],
    },
    {
      id: "third-chapter",
      alignment: "left",
      hidden: false,
      title: "Fiji",
      description: "placeholder",
      location: {
        center: [178.35017, -16.81771],
        zoom: 4,
        pitch: 0,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "fiji-7fwess", opacity: 1, duration: 500 },
        { layer: "mauritius-2f63d9", opacity: 0 },
      ],
      onChapterExit: [{ layer: "fiji-7fwess", opacity: 0 }],
    },
    {
      id: "fourth-identifier",
      alignment: "left",
      hidden: false,
      title: "Mauritius",
      description: "placeholder",
      location: {
        center: [57.61277, -20.28548],
        zoom: 5.9,
        pitch: 8.01,
        bearing: 0.0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "mauritius-2f63d9", opacity: 1, duration: 500 },
        { layer: "southafrica-cejbuq", opacity: 0 },
      ],
      onChapterExit: [{ layer: "mauritius-2f63d9", opacity: 0 }],
    },
    {
      id: "fifth-identifier",
      alignment: "left",
      hidden: false,
      title: "South Africa",
      description: "placeholder",
      location: {
        center: [24.69611, -28.63897],
        zoom: 3.3,
        pitch: 2,
        bearing: 0.0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "southafrica-cejbuq", opacity: 1, duration: 500 },
        { layer: "suriname-4qdym1", opacity: 0 },
      ],
      onChapterExit: [{ layer: "southafrica-cejbuq", opacity: 0 }],
    },
    {
      id: "sixth-identifier",
      alignment: "left",
      hidden: false,
      title: "Suriname",
      description: "placeholder",
      location: {
        center: [-55.98561, 3.96607],
        zoom: 5,
        pitch: 2,
        bearing: 0.0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "suriname-4qdym1", opacity: 1, duration: 500 },
        { layer: "guyana-3800mj", opacity: 0 },
      ],
      onChapterExit: [{ layer: "suriname-4qdym1", opacity: 0 }],
    },
    {
      id: "seventh-identifier",
      alignment: "left",
      hidden: false,
      title: "Guyana",
      description: "placeholder",
      location: {
        center: [-58.93945, 4.89961],
        zoom: 5,
        pitch: 2,
        bearing: 0.0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "guyana-3800mj", opacity: 1, duration: 500 },
        { layer: "trinidad-b15b7e", opacity: 0 },
      ],
      onChapterExit: [{ layer: "guyana-3800mj", opacity: 0 }],
    },
    {
      id: "eigth-identifier",
      alignment: "left",
      hidden: false,
      title: "Trinidad & Tobago",
      description: "placeholder",
      location: {
        center: [-61.21425, 10.7024],
        zoom: 5.5,
        pitch: 2,
        bearing: 0.0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        { layer: "trinidad-b15b7e", opacity: 1, duration: 500 },
        { layer: "jamaica-3cm6o4", opacity: 0 },
      ],
      onChapterExit: [{ layer: "trinidad-b15b7e", opacity: 0 }],
    },
    {
      id: "ninth-identifier",
      alignment: "left",
      hidden: false,
      title: "Jamaica",
      description: "placeholder",
      location: {
        center: [-77.27887, 18.11581],
        zoom: 5.9,
        pitch: 2,
        bearing: 0.0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [{ layer: "jamaica-3cm6o4", opacity: 1, duration: 500 }],
      onChapterExit: [{ layer: "jamaica-3cm6o4", opacity: 0 }],
    },
  ],
};

config.chapters.forEach((chapter) => {
  const countryInfo = countrySummary.find(
    (country) => country.countryName === chapter.title
  );

  if (countryInfo) {
    chapter.description = `
          <div>
          <hr class="map-description-line">
          <p class="map-description-item"><strong>Region:</strong><span>${countryInfo.geographicRegion.join(
            ", "
          )}</span></p>
          <p class="map-description-item"><strong>Indentureship Period:</strong><span>${
            countryInfo.startYear
          }-${countryInfo.endYear}</span></p>
          <p class="map-description-item"><strong>No. of Voyages:</strong><span>${
            countryInfo.numVoyages
          }</span></p>
          <p class="map-description-item"><strong>No. of Indentures:</strong><span>~${countryInfo.numIndentures.toLocaleString()}</span></p>
          <p class="map-description-item"><strong>Prim. Origins:</strong><span>${countryInfo.origins.join(
            ", "
          )}</span></p></div>
        `;
  } else {
    chapter.description = chapter.description || "";
  }
});

export default config;
