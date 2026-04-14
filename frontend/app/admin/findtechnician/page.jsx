"use client";
import { useState } from "react";
import axiosClient from "../../utils/apis";

export default function AdminSearch() {
  const [problem, setProblem] = useState("");
  const [radius, setRadius] = useState(2);
  const [limit, setLimit] = useState(5);
  const [shops, setShops] = useState([]);

  const fetchShops = async () => {
    try {
      const res = await axiosClient.get(
        `admin/nearby-shops/?problem=${problem}&radius=${radius}&limit=${limit}`
      );

      const data = res.data; // ✅ FIXED
      setShops(data.shops);

    } catch (err) {
  console.log("FULL ERROR:", err);
  console.log("RESPONSE:", err.response);
  console.log("DATA:", err.response?.data);
}
  };

  return (
    <div>
      <h2>Find Nearby Technicians</h2>

      <input
        placeholder="Enter problem (AC, laptop)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />

      <input
        type="number"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
      />

      <select value={limit} onChange={(e) => setLimit(e.target.value)}>
        <option value={5}>Top 5</option>
        <option value={10}>Top 10</option>
      </select>

      <button onClick={fetchShops}>Search</button>

      {shops.map((shop, i) => (
        <div key={i} style={{border:"1px solid #ccc", margin:"10px", padding:"10px"}}>
          <h3>{shop.name}</h3>
          <p>📍 {shop.address || "Address not available"}</p>
          <p>📏 {shop.distance} km</p>
        </div>
      ))}
    </div>
  );
}