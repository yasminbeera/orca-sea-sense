export type RegionId =
  | "india"
  | "andhra-pradesh"
  | "bay-of-bengal"
  | "tamil-nadu"
  | "odisha"
  | "kerala"
  | "gujarat"
  | "andaman";

export interface Region {
  id: RegionId;
  name: string;
  localName?: string;
  /** [lonMin, latMin, lonMax, latMax] */
  bounds: [number, number, number, number];
  center: [number, number]; // lat, lon
  detailedAP: boolean;
  waterBody: string;
  seed: number;
}

export const REGIONS: Region[] = [
  {
    id: "india",
    name: "India",
    localName: "భారతదేశం",
    bounds: [77.5, 12.0, 88.0, 21.5],
    center: [16.8, 82.5],
    detailedAP: true,
    waterBody: "Bay of Bengal",
    seed: 11,
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    localName: "ఆంధ్రప్రదేశ్",
    bounds: [78.8, 13.2, 86.0, 19.4],
    center: [16.4, 82.2],
    detailedAP: true,
    waterBody: "Bay of Bengal",
    seed: 23,
  },
  {
    id: "bay-of-bengal",
    name: "Bay of Bengal",
    localName: "బంగాళాఖాతం",
    bounds: [79.0, 10.0, 92.0, 21.0],
    center: [15.5, 85.5],
    detailedAP: true,
    waterBody: "Bay of Bengal",
    seed: 37,
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    localName: "தமிழ்நாடு",
    bounds: [77.0, 8.0, 82.5, 13.6],
    center: [11.2, 79.9],
    detailedAP: false,
    waterBody: "Bay of Bengal",
    seed: 41,
  },
  {
    id: "odisha",
    name: "Odisha",
    localName: "ଓଡ଼ିଶା",
    bounds: [82.5, 17.5, 88.0, 22.5],
    center: [19.8, 85.5],
    detailedAP: false,
    waterBody: "Bay of Bengal",
    seed: 53,
  },
  {
    id: "kerala",
    name: "Kerala",
    localName: "കേരളം",
    bounds: [72.5, 8.0, 77.5, 13.0],
    center: [10.2, 75.4],
    detailedAP: false,
    waterBody: "Arabian Sea",
    seed: 59,
  },
  {
    id: "gujarat",
    name: "Gujarat",
    localName: "ગુજરાત",
    bounds: [66.5, 19.0, 73.5, 24.5],
    center: [21.5, 69.8],
    detailedAP: false,
    waterBody: "Arabian Sea",
    seed: 67,
  },
  {
    id: "andaman",
    name: "Andaman & Nicobar",
    bounds: [90.0, 6.0, 96.0, 14.5],
    center: [11.0, 92.8],
    detailedAP: false,
    waterBody: "Andaman Sea",
    seed: 71,
  },
];

export const getRegion = (id: RegionId): Region =>
  REGIONS.find((r) => r.id === id) ?? REGIONS[0];

export interface CoastalPlace {
  name: string;
  telugu?: string;
  lat: number;
  lon: number;
  major?: boolean;
}

/** Andhra Pradesh coastline (approximate, sea-facing), lon/lat pairs. */
export const AP_COAST: [number, number][] = [
  [84.35, 19.05],
  [84.05, 18.55],
  [83.85, 18.28],
  [83.45, 17.95],
  [83.32, 17.72],
  [82.95, 17.45],
  [82.6, 17.2],
  [82.35, 16.98],
  [82.28, 16.62],
  [81.95, 16.35],
  [81.5, 16.3],
  [81.15, 16.18],
  [80.9, 15.94],
  [80.62, 15.72],
  [80.35, 15.35],
  [80.15, 14.85],
  [80.05, 14.42],
  [80.12, 13.95],
  [80.2, 13.5],
];

export const AP_PLACES: CoastalPlace[] = [
  { name: "Srikakulam", telugu: "శ్రీకాకుళం", lat: 18.3, lon: 83.9 },
  { name: "Vizianagaram", telugu: "విజయనగరం", lat: 18.11, lon: 83.41 },
  { name: "Visakhapatnam", telugu: "విశాఖపట్నం", lat: 17.69, lon: 83.22, major: true },
  { name: "Kakinada", telugu: "కాకినాడ", lat: 16.95, lon: 82.24, major: true },
  { name: "Rajahmundry", telugu: "రాజమండ్రి", lat: 17.0, lon: 81.78 },
  { name: "Amalapuram", telugu: "అమలాపురం", lat: 16.58, lon: 82.01 },
  { name: "Machilipatnam", telugu: "మచిలీపట్నం", lat: 16.19, lon: 81.14, major: true },
  { name: "Vijayawada", telugu: "విజయవాడ", lat: 16.51, lon: 80.65 },
  { name: "Bapatla", telugu: "బాపట్ల", lat: 15.9, lon: 80.47 },
  { name: "Ongole", telugu: "ఒంగోలు", lat: 15.5, lon: 80.05 },
  { name: "Nellore", telugu: "నెల్లూరు", lat: 14.44, lon: 79.99 },
];

export const OTHER_PLACES: Record<string, CoastalPlace[]> = {
  "tamil-nadu": [
    { name: "Chennai", lat: 13.08, lon: 80.27, major: true },
    { name: "Puducherry", lat: 11.93, lon: 79.83 },
    { name: "Nagapattinam", lat: 10.76, lon: 79.84 },
    { name: "Rameswaram", lat: 9.28, lon: 79.31 },
    { name: "Tuticorin", lat: 8.8, lon: 78.13 },
  ],
  odisha: [
    { name: "Gopalpur", lat: 19.26, lon: 84.9 },
    { name: "Puri", lat: 19.81, lon: 85.83, major: true },
    { name: "Paradip", lat: 20.31, lon: 86.61, major: true },
    { name: "Chandbali", lat: 20.78, lon: 86.74 },
  ],
  kerala: [
    { name: "Thiruvananthapuram", lat: 8.52, lon: 76.94, major: true },
    { name: "Kollam", lat: 8.89, lon: 76.6 },
    { name: "Kochi", lat: 9.93, lon: 76.26, major: true },
    { name: "Kozhikode", lat: 11.25, lon: 75.78 },
    { name: "Kannur", lat: 11.87, lon: 75.37 },
  ],
  gujarat: [
    { name: "Porbandar", lat: 21.64, lon: 69.6 },
    { name: "Veraval", lat: 20.9, lon: 70.37, major: true },
    { name: "Dwarka", lat: 22.24, lon: 68.97 },
    { name: "Okha", lat: 22.47, lon: 69.07 },
    { name: "Surat", lat: 21.17, lon: 72.83, major: true },
  ],
  andaman: [
    { name: "Port Blair", lat: 11.62, lon: 92.73, major: true },
    { name: "Diglipur", lat: 13.25, lon: 92.98 },
    { name: "Car Nicobar", lat: 9.17, lon: 92.77 },
  ],
};

export function placesFor(region: Region): CoastalPlace[] {
  if (region.detailedAP) return AP_PLACES;
  return OTHER_PLACES[region.id] ?? AP_PLACES;
}
