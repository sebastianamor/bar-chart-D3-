const svg = d3.select("svg");
const margin = { top: 80, right: 60, bottom: 50, left: 100 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// Crear el tooltip
const tooltip = d3.select("#tooltip");

// Función para obtener datos de la API
async function fetchData() {
  try {
    const response = await fetch(apiUrl); // Hacer la solicitud GET
    if (!response.ok) {
      throw new Error("Error al obtener los datos");
    }
    const data = await response.json(); // Convertir la respuesta a JSON
    processData(data); // Procesar y mostrar los datos
  } catch (error) {
    console.error("Error:", error);
  }
}

// Función para procesar los datos y crear la gráfica
function processData(data) {
  const dataset = data.data; // Extraer el array de datos

  // Formatear los datos
  const formattedData = dataset.map(d => ({
    date: new Date(d[0]), // Convertir la fecha a un objeto Date
    value: d[1], // Valor del PIB
  }));

  // Escalas
  const x = d3.scaleTime()
    .domain([d3.min(formattedData, d => d.date), d3.max(formattedData, d => d.date)])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => d.value)])
    .range([height, 0]);

  // Eje X
  g.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // Eje Y
  g.append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(y));

  // Barras
  g.selectAll(".bar")
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("data-date", d => d.date.toISOString().split('T')[0]) // Formato YYYY-MM-DD
    .attr("data-gdp", d => d.value) // Valor del GDP
    .attr("x", d => x(d.date)) // Posición x basada en la escala de tiempo
    .attr("y", d => y(d.value)) // Posición y basada en la escala lineal
    .attr("width", (width / formattedData.length) - 1) // Ancho de las barras con espacio entre ellas
    .attr("height", d => height - y(d.value)) // Altura de las barras
    .attr("fill", "#0de21a")
    .on("mouseover", function (event, d) {
      // Mostrar el tooltip
      tooltip.style("opacity", 0.9)
        .html(`Fecha: ${d.date.toISOString().split('T')[0]}<br>PIB: $${d.value} billones`)
        .attr("data-date", d.date.toISOString().split('T')[0]) // Establecer data-date
        .style("left", `${event.pageX + 5}px`) // Posicionar el tooltip
        .style("top", `${event.pageY - 38}px`);
    })
    .on("mouseout", function () {
      // Ocultar el tooltip
      tooltip.style("opacity", 0);
    });
}

// Llamar a la función para obtener los datos
fetchData();