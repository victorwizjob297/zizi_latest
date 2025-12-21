export const zimbabweLocations = {
  Bulawayo: ["Khami", "Reigate", "Bulawayo Central", "Mzilikhazi", "Mbizo"],
  Harare: [
    "Chitungwiza",
    "Highfield/Glennorah",
    "Glenview/Mufakose",
    "Warren Park/Mabelreign",
    "Northern Central",
    "Epworth/Mabvuku/Tafara",
    "Mbare/Hatfield",
  ],
  Manicaland: [
    "Buhera",
    "Chimanimani",
    "Chipinge",
    "Makoni",
    "Mutare",
    "Mutasa",
    "Nyanga",
  ],
  "Mashonaland Central": [
    "Bindura",
    "Guruve",
    "Mazowe",
    "Mbire",
    "Mukumbura",
    "Muzarabani",
    "Rushinga",
  ],
  "Mashonaland East": [
    "Chikomba",
    "Goromonzi",
    "Hwedza",
    "Marondera",
    "Mudzi",
    "Murehwa",
    "Mutoko",
    "Seke",
    "Uzumba-Maramba-Pfungwe",
  ],
  "Mashonaland West": [
    "Makonde",
    "Sanyati",
    "Zvimba",
    "Chegutu",
    "Mhondoro Ngezi",
    "Kariba",
    "Hurungwe",
  ],
  Masvingo: [
    "Bikita",
    "Chiredzi",
    "Chivi",
    "Gutu",
    "Masvingo",
    "Mwenezi",
    "Zaka",
  ],
  "Matabeleland North": [
    "Binga",
    "Bubi",
    "Hwange",
    "Lupane",
    "Nkayi",
    "Tsholotsho",
    "Umguza",
  ],
  "Matabeleland South": [
    "Beitbridge",
    "Bulilimamangwe",
    "Gwanda",
    "Insiza",
    "Matobo",
    "Umzingwane",
  ],
  Midlands: [
    "Chirumhanzi",
    "Gokwe North",
    "Gokwe South",
    "Gweru",
    "Kwekwe",
    "Mberengwa",
    "Shurugwi",
    "Zvishavane",
  ],
};

export type Province = keyof typeof zimbabweLocations;
export type District = string;

export const provinces = Object.keys(zimbabweLocations) as Province[];

export const getDistrictsByProvince = (province: Province): string[] => {
  return zimbabweLocations[province] || [];
};

export const getAllDistricts = (): string[] => {
  return Object.values(zimbabweLocations).flat();
};

export const getProvinceByDistrict = (district: string): Province | null => {
  for (const [province, districts] of Object.entries(zimbabweLocations)) {
    if (districts.includes(district)) {
      return province as Province;
    }
  }
  return null;
};

// Total counts for verification
export const provinceCount = provinces.length;
export const districtCount = getAllDistricts().length;

console.log(
  `Zimbabwe has ${provinceCount} provinces and ${districtCount} districts`
);
