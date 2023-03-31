import React, { useState, useEffect } from "react";

function DetailsPage(props) {
  const { id } = props.match.params.id;
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=G7ggBB8HX46knK1ODzE8HM6BL3nvvadzKEahVqjD`);
      const result = await response.json();
      setData(result);
    }
    fetchData();
  }, [id]);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{data.title}</h1>
      <img src={data.url} alt={data.title} />
      <p>{data.explanation}</p>
    </div>
  );
}

export default DetailsPage;
