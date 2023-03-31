import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [visualizationType, setVisualizationType] = useState("table");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=G7ggBB8HX46knK1ODzE8HM6BL3nvvadzKEahVqjD`
        );
        const dataPoints = res.data.near_earth_objects.map((item) => ({
          id: item.id,
          name: item.name,
          date: item.close_approach_data[0]?.close_approach_date_full,
          absoluteMagnitude: item.absolute_magnitude_h,
          estimatedDiameter: item.estimated_diameter.kilometers.estimated_diameter_max,
        }));            
        const uniqueDataPoints = [...new Map(dataPoints.map((item) => [item.id, item])).values(),
        ].slice(0, 15);
        setData(uniqueDataPoints);
        setFilteredData(uniqueDataPoints);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setSearchQuery(e.target.value);
    const filteredData = data.filter(
      (item) =>
        item.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
        item.date.toLowerCase().includes(e.target.value.toLowerCase()) ||
        (item.absoluteMagnitude &&
          item.absoluteMagnitude
            .toString()
            .toLowerCase()
            .includes(e.target.value.toLowerCase())) ||
        (item.estimatedDiameter &&
          item.estimatedDiameter
            .toString()
            .toLowerCase()
            .includes(e.target.value.toLowerCase()))
    );
    setFilteredData(filteredData);
  };
  

  const handleMoreDetails = async (item) => {
    try {
      const res = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/neo/${item.id}?api_key=G7ggBB8HX46knK1ODzE8HM6BL3nvvadzKEahVqjD`
      );
      const {
        name,
        nasa_jpl_url,
        estimated_diameter,
        close_approach_data,
      } = res.data;
      const description = res.data.is_potentially_hazardous_asteroid
        ? "Potentially hazardous"
        : "Not potentially hazardous";
      setSelectedItem({
        name,
        nasa_jpl_url,
        estimatedDiameter:
          estimated_diameter.kilometers.estimated_diameter_max,
        close_approach_data,
        description,
        date: item.date, // Add the date property from the original item to selectedItem
        absoluteMagnitude: item.absoluteMagnitude, // Add the absoluteMagnitude property from the original item to selectedItem
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  return (
    <div className="App">
      <header>
        <h1>Welcome to NASA</h1>
        <h3>This data is extremely interesting because it provides information about near-Earth objects and any potential threats there may be to Earth. It shows statistics about the data displayed on the website, data visualizations, and specific characteristics about each data point. Read on and search for objects to find out more about NEOs!</h3>
        <h3>Data Set Size: {data.length} </h3>
        <h3>
          Average Magnitude:{" "}
          {filteredData.reduce(
            (sum, item) => sum + Math.abs(item.absoluteMagnitude),
            0
          ) / filteredData.length}
        </h3>
        <h3>
          Average Diameter:{" "}
          {filteredData.reduce(
            (sum, item) => sum + Math.abs(item.estimatedDiameter),
            0
          ) / filteredData.length}
        </h3>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleFilterChange}
        />
        <button onClick={() => setVisualizationType("bar")}>Bar Chart</button>
        <button onClick={() => setVisualizationType("line")}>Line Chart</button>
        <button onClick={() => setVisualizationType("area")}>Area Chart</button>
      </header>
      <section>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Absolute Magnitude</th>
              <th>Estimated Diameter (km)</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.date}</td>
                <td>{item.absoluteMagnitude}</td>
                <td>{item.estimatedDiameter}</td>
                <td>
                  <button onClick={() => handleMoreDetails(item)}>Click for more!</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedItem && (
          <div>
            <h2>{selectedItem.name}</h2>
            <p>
              <strong>Date:</strong> {selectedItem.date}
            </p>
            <p>
              <strong>Absolute Magnitude:</strong>{" "}
              {selectedItem.absoluteMagnitude}
            </p>
            <p>
              <strong>Estimated Diameter (km):</strong>{" "}
              {selectedItem.estimatedDiameter}
            </p>
            <p>
              <strong>Relative Velocity:</strong>{" "}
              {selectedItem.close_approach_data[0].relative_velocity.kilometers_per_second}
            </p>
            <p>
              <strong>Miss Distance (au):</strong>{" "}
              {selectedItem.close_approach_data[0].miss_distance.astronomical}
            </p>
            <p>
              <strong>Description:</strong> {selectedItem.description}
            </p>
            <button onClick={handleCloseDetails}>Close Details</button>
          </div>
        )}
      </section>
      {visualizationType === "bar" && (
        <BarChart width={600} height={300} data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="absoluteMagnitude" fill="#8884d8" />
          <Bar dataKey="estimatedDiameter" fill="#82ca9d" />
        </BarChart>
      )}
        {visualizationType === "line" && (
          <LineChart width={700} height={300} data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="absoluteMagnitude" stroke="#8884d8" />
            <Line type="monotone" dataKey="estimatedDiameter" stroke="#82ca9d" />
          </LineChart>
        )}
        {visualizationType === "area" && (
          <AreaChart width={700} height={300} data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="absoluteMagnitude" fill="#8884d8" stroke="#8884d8" />
            <Area type="monotone" dataKey="estimatedDiameter" fill="#82ca9d" stroke="#82ca9d" />
          </AreaChart>
        )}
    </div>
  );
}
export default App;  