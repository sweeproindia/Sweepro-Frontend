/**
 * M3 FIX: SERVICE_ADDRESSES was copy-pasted identically in both
 * LoginPage.tsx and SignupPage.tsx (39 entries × 2 = 78 lines of duplication).
 *
 * Update here once — both pages auto-get the change.
 */
export const SERVICE_ADDRESSES = [
  "Manikonda",
  "Gachibowli",
  "Kondapur",
  "Hitech City",
  "Madhapur",
  "Banjara Hills",
  "Jubilee Hills",
  "Kukatpally",
  "Miyapur",
  "Ameerpet",
  "SR Nagar",
  "Begumpet",
  "Secunderabad",
  "Uppal",
  "LB Nagar",
  "Dilsukhnagar",
  "Mehdipatnam",
  "Tolichowki",
  "Narsingi",
  "Kokapet",
  "Nanakramguda",
  "Financial District",
  "Raidurg",
  "Wipro Circle",
  "Khajaguda",
  "Puppalaguda",
  "Gandipet",
  "Tellapur",
  "Patancheru",
  "Bachupally",
  "Kompally",
  "Medchal",
  "Alwal",
  "Malkajgiri",
  "Nacharam",
  "Nagole",
  "Hayathnagar",
  "Vanasthalipuram",
  "Saroornagar",
] as const;

export type ServiceAddress = (typeof SERVICE_ADDRESSES)[number];
