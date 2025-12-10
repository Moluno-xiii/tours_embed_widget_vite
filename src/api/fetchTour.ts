import mockTour from "../mockData";
import type { Tour } from "../types";
const baseUrl = "";

const fetchTour = async (tourId: string, useMock: boolean = false) => {
  const bacendUrl = `${baseUrl}/${tourId}`;
  try {
    if (useMock) {
      return mockTour;
    }
    const response = await fetch(bacendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "omit",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch tour or tour does not exist .");
    }
    const data: Tour = await response.json();
    return data;
  } catch (error) {
    console.error("Tour fetch error", error);
    throw error;
  }
};

export default fetchTour;
