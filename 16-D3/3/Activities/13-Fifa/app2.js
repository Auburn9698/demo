var svgWidth = 1160;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,// and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenYAxis = "value_euros";

// function used for updating y-scale var upon click on axis label
function yScale(fifaData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(fifaData, d => d[chosenYAxis]) * 0.8,
      d3.max(fifaData, d => d[chosenYAxis]) * 1.2
    ])
    .range(height, 0);

  return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, circlesGroup) {

  var label;

  if (chosenYAxis === "value_euros") {
    label = "Value in Euros:";
  }
  else {
    label = "Body Mass Index:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.name}<br>${label} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("fifa21.csv").then(function(fifaData, err) {
  if (err) throw err;

  // parse data
  fifaData.forEach(function(data) {
    data.value = +data.value;
    data.overall = +data.overall;
    data.bmi = +data.bmi;
  });

  var yLinearScale = yScale(fifaData, chosenYAxis);

  // Create y scale function
  var xLinearScale = d3.scaleLinear()
    .domain([70, d3.max(fifaData, d => d.overall)])
    .range([0, width]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(fifaData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.overall))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 8)
    .attr("fill", "orange")
    .attr("opacity", ".5");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("FIFA 21 Overall Rating");


  // Create group for multiple y-axis labels called labelsGroupY
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(${width - 1000}, ${height / 2})`);  //width - 1100 to line up with y axis

  var valueLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)") // rotate 90 degrees
    .attr("x", 0)
    .attr("y", -20)
    .attr("value", "value_euros")
    .classed("active", true)  /// this one is active
    .text("Value in Euros");

  var bmiLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)") // rotate 90 degrees
    .attr("x", 0)
    .attr("y", -40)
    .attr("value", "bmi")
    .classed("inactive", true)
    .text("Body Mass Index");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

  // Y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(fifaData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, YAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
        

        // changes classes to change bold text
        if (chosenYAxis === "value_euros") {
          valueLabel
            .classed("active", true)
            .classed("inactive", false);
          bmiLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          valueLabel
            .classed("active", false)
            .classed("inactive", true);
          bmiLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
