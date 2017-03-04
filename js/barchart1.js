function barchart1(data, partyAbbreviations, partyColors){

  self.data = data;

  // Margins, top, left, bottom, right .
  var m = [50, 10, 10, 230];

  var barchartDiv = $("#bar1");
 
  var w = barchartDiv.width() - m[1] - m[3],
      h = barchartDiv.height() -  m[0] - m[2]; 

  var format = d3.format(",.0f");

  var x = d3.scale.linear().range([0, w]),
      y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

  var svg2 = d3.select("#bar1").append("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
      .append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")"); 

  // Initialize tooltip.
  // Taken from: http://bl.ocks.org/biovisualize/1016860
  var tooltip = d3.select("body")
                  .append("div")
                  .style("position", "absolute");

   
    var year = "Year=2014";
    //console.log(data[0]);
    //console.log(data[1]); // To debug webdings shit

    // Convert the percentages to numeric values.
    data.forEach(function(d) { 

      if(d[year] > 0){
        d[year] = +d[year];
      }else{
        // Get rid of junk data.
        d[year] = 0;
      }
    });

    

    // Sort by the percentages.
    data.sort(function(a, b) { return b[year] - a[year]; });  // TODO DUBBELKOLLA SÅ INTE SORTERAR ALLA KOMMUNERS PERCENTAGES PÅ EN GÅNG!!!!!!!!!!!!!!

    var citiesArray = [];
    
    // Collect all the entries with the same key (city)
    // and get all of the information for each city.
    citiesArray = d3.nest()
                    .key(function(d){
                      return d.region;
                    })
                    .entries(data);

    citiesArray.keys = _.values(citiesArray);
    //console.log(citiesArray[0].values[2]); // DENNA GER ETT OBJEKT, om ändrar 2an, så ändras parti.

    // Set the scale domain.
    x.domain([0, d3.max(data, function(d) { return d[year]; })]);  // TODO ändra så istället för data är det citiesArray
    

    // Get the nr of political parties.
    var nrPoliticalParties = citiesArray[0].values.length;
    var partiesAbbrevSortedArray = [];

    // Set the domain for the y-axis.
    for(var idx = 0; idx < nrPoliticalParties; idx++){        // TODO ÄNDRA DENNA
        // Get the party's name.
        var politicalPartyName = citiesArray[0].values[idx].party; // TODO ändra nollan för grundstaden

        // Use the abbreviations for each party.
        partiesAbbrevSortedArray.push(partyAbbreviations[politicalPartyName]);

        y.domain(partiesAbbrevSortedArray);
    }

       var testRegion = "1762 Munkfors";

    // Get the information from the chosen city.
    // Will be used later when drawing the bar chart.
    var chosenCityObject;
    
    for(var idx = 0; idx < citiesArray.length; idx++){

      var tempCity = citiesArray[idx].key;

      // Check if it's the chosen city and save it.
      if(tempCity.includes(testRegion)) {
        //console.log(citiesArray[idx]);
        chosenCityObject = citiesArray[idx];
        //console.log(chosenCityStats); // Object { key: "1762 Munkfors", values: Array[11] }
      }
    } 


    //console.log(chosenCityObject.values[10]);


    // Save the information about the percentage of the votes
    // for each party, in the chosen city.
    var chosenCityStats = chosenCityObject.values;

    draw(chosenCityStats);

    //console.log(chosenCityStats.values);  // Array [ Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, 1 till… ]
    //console.log(chosenCityStats.values[0].party); // Object { region: "1762 Munkfors", party: "Socialdemokraterna", Year=2014: 58.1 }
    //console.log(chosenCityStats.values[1].party); // Object { region: "1762 Munkfors", party: "Sverigedemokraterna", Year=2014: 11.4 }

  function draw(chosenCityStats){
    // All of the code below draws the bar chart.
    var bar = svg2.selectAll("g.bar")
        .data(chosenCityStats)
        .enter().append("g")
        .attr("class", "bar")
        // Transforms/translates downwards to each row, for each party.
        .attr("transform", function(d, i) { 
          //console.log(d.party); // varje parti, en i taget
          return "translate(0," + y(partiesAbbrevSortedArray[i]) + ")";
        });

    // Draws the bars.
    bar.append("rect")
        .attr("width", function(d) { 
          //console.log(d[year]); // varje voting procent.
          return  x(d[year]);           
        })
        .attr("height", y.rangeBand())
        .style("fill", function(d,i) { 
          //console.log(d.party);
          return partyColors[d.party]; 
        })
        .on("mouseover", function(d) {
            return tooltip.style("visibility", "visible");
        })
        // Display the party's full name when the cursor is hovered above.
        .on("mousemove", function(d) {
            return tooltip.style("top", (d3.event.pageY-10)+"px")
                          .style("left",(d3.event.pageX+10)+"px")
                          .text( d.party )
                          .style("font-weight", "bold")
                          .style("font-size", "20px");
        })
        .on("mouseout", function(d) {
            return tooltip.style("visibility", "hidden");  
        })
        .transition()
        .duration(750);
    


    // Drawing the percentage at the end of the bars.
    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) { 
          //console.log(x(d[year])); 
          return x(d[year]); 
        })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", function(d) { 
          //console.log(d[year]);
          return -3;
        })                                 
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { 

          // Don't display the value zero.
          if(d[year] > 0){
            return d[year] + "%";
          }else{
            return "";
          }

        })
        .style("font-weight", "bold")
        .style("font-size", "10px");

    // Adding the x-axis.
    svg2.append("g")
        .style("font-weight", "bold")
        .style("font-size", "18px")
        .attr("class", "x axis")
        // Grey color.
        .style("fill", function(d,i) { return "#808080"; })
        .call(xAxis);

    // Adding the y-axis.
    svg2.append("g")
        .attr("class", "y axis")
        //.style("font-weight", "bold")
        .style("font-size", "21px")
        .transition()
        .duration(450)
        .call(yAxis);
  }

  function setDomains(citiesArrayIndex){
    
    // Clear the array from previously stored values.
    partiesAbbrevSortedArray.splice(0,partiesAbbrevSortedArray.length)

    // Set the domain for the y-axis.
    for(var idx = 0; idx < nrPoliticalParties; idx++){        // TODO ÄNDRA DENNA
        // Get the party's name.
        var politicalPartyName = citiesArray[citiesArrayIndex].values[idx].party;

        // Use the abbreviations for each party.
        partiesAbbrevSortedArray.push(partyAbbreviations[politicalPartyName]);

        y.domain(partiesAbbrevSortedArray);
    }
    //y.domain(partiesAbbrevSortedArray.map(function(d){ console.log(d); return d; }));
    
    // Clear the domain.
    svg2.select(".y.axis").remove();

    // Change the y-axis.
    svg2.select(".y.axis")
        .call(yAxis);
  }
        

  this.showSelectedRegionStats = function(selectedRegionString){

    // Get the information from the chosen region.
    // Will be used later when drawing the bar chart.
    var chosenCityObject;
    var citiesArrayIndex = 0;

    for(idx = 0; idx < citiesArray.length; idx++){ // in citiesArray){

      var tempCity = citiesArray[idx].key;

      // Check if it's the chosen city and save it.
      if(tempCity.includes(selectedRegionString)) {
        
        chosenCityObject = citiesArray[idx];
        citiesArrayIndex = idx;
      }
    } 

    // Clear previous drawings.
    svg2.selectAll("g.bar").remove();

    // Save the information about the percentage of the votes
    // for each party, in the chosen city.
    var chosenCityStats = chosenCityObject.values;

    // Set the new sorted domains for the axes.
    setDomains(citiesArrayIndex);

    // Draw the chosen city's stats.
    draw(chosenCityStats);
  }

}





