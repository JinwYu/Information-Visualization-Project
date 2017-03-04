function barchart2(data, partyAbbreviations, partyColors){

  self.data = data;

  // Margins, top, left, bottom, right .
  var m = [50, 10, 10, 230];

  var barchartDiv = $("#bar2");

 
  var  w = barchartDiv.width() - m[1] - m[3],
       h = barchartDiv.height() -  m[0] - m[2]; 

  var format = d3.format(",.0f");

  var x = d3.scale.linear().range([0, w]),
      y = d3.scale.ordinal().rangeRoundBands([0, h], .1);

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h),
      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

  var svg1 = d3.select("#bar2").append("svg")
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

  // Fixa så tar maxvärdet ett parti fått från hela sverige och sätt som x-led domain
  // genom att använda citiesArray.

  var testRegion = "1762 Munkfors";
  



  //console.log(citiesArray[0].key); // Visar "1762 munkfors" 
  
  //x.domain([0, d3.max(data, function(d) { return d.values; })]);  // TODO ändra så istället för data är det citiesArray
  //y.domain(data.map(function(d) { return d.name;  }));

  // Get the information from the chosen city.
  // Will be used later when drawing the bar chart.
  var chosenCityObject;
  
  for(idx in citiesArray){

    var tempCity = citiesArray[idx].key;

    // Check if it's the chosen city and save it.
    if(tempCity === testRegion) {
      //console.log(citiesArray[idx]);
      chosenCityObject = citiesArray[idx];
      //console.log(chosenCityStats); // Object { key: "1762 Munkfors", values: Array[11] }
    }
  } 
  //console.log(chosenCityObject.values[10]); // visar partiet "ej röstande".


  // Save the information about the percentage of the votes
  // for each party, in the chosen city.
  var chosenCityStats = chosenCityObject.values;

  //console.log(chosenCityStats[1]); // Gives an object for one city, the party changes with the index. For example: "Socialdemokraterna".
  //console.log(chosenCityStats[1][year]); // Gives the vote percentage, for the party. For example: "11.4".

  //------------------------------------------------

  // Get the nr of political parties.
  var nrPoliticalParties = citiesArray[0].values.length;
  var redPercentage = bluePercentage = theRestPercentage = 0;

  // Calculate the percentage for each block.
  var redBlock = ["Socialdemokraterna", "Vänsterpartiet", "Miljöpartiet"];
  var blueBlock = ["Moderaterna", "Folkpartiet", "Centerpartiet", "Kristdemokraterna"];
  var theRest = ["Sverigedemokraterna", "övriga partier", "ej röstande", "ogiltiga valsedlar"];

  for(var idx = 0; idx < nrPoliticalParties; idx++){    
    
    var hasAddedPercentage = false;

    // If the party belongs to the red block.
    if(!hasAddedPercentage){
      for(idu in redBlock){
        if(chosenCityStats[idx].party === redBlock[idu]){
          redPercentage += chosenCityStats[idx][year];
          hasAddedPercentage = true;
          // If the party's percentage has been added, break the loop.
          break;  
        }
      }   
    }   

    // If the party belongs to the blue block.
    if(!hasAddedPercentage){
      for(idu in blueBlock){
        if(chosenCityStats[idx].party === blueBlock[idu]){
          bluePercentage += chosenCityStats[idx][year];
          hasAddedPercentage = true;  
          break;
        }      
      }   
    }   

    // If the party belongs to the rest.
    if(!hasAddedPercentage){
      for(idu in theRest){
        if(chosenCityStats[idx].party === theRest[idu]){
          theRestPercentage += chosenCityStats[idx][year];
          hasAddedPercentage = true;  
          break;
        }      
      }   
    } 
  }


  var blockColors = 
  {
    "Rödgröna":"#ff2020",
    "Alliansen":"#52bdec",  
    "Övriga":"#A9A9A9", 
  };

  var percentages = 
  [
    {block: "Rödgröna", Övriga: redPercentage},
    {block: "Alliansen", percentage: bluePercentage},
    {block: "Övriga", percentage: theRestPercentage}
  ];

  var sorted = percentages.slice(0).sort(function(a, b) {
   return b.percentage - a.percentage;
  });

  // Sort the array according to the percentage value, so
  // that this order will have the same order as the array "percentagesArray".
  var abbrevsSorted = [];
  for (var i = 0, len = sorted.length; i < len; ++i) {
      abbrevsSorted[i] = sorted[i].block;
  }

  // Set the domain for the y-axis.
  y.domain(abbrevsSorted);

  //------------------------------------------------

  // Get the nr of blocks.
  var nrBlocks = 3;
  var blocksAbbrevArray = [];

  var percentagesArray = [redPercentage, bluePercentage, theRestPercentage];

  // Sort the array that contains the percentages.
  percentagesArray.sort(function(a, b){return b - a}); 

  // Set the scale domain for the x-axis.
  x.domain([0, d3.max(percentagesArray, function(d) { return d; })]); 

  draw(percentages, percentagesArray, abbrevsSorted);

  //------------------------------------------------

function draw(percentages, percentagesArray, abbrevsSorted){
  // All of the code below draws the bar chart.
  var bar = svg1.selectAll("g.bar")
      .data(percentages)
      .enter().append("g")
      .attr("class", "bar")
      // Transforms/translates downwards to each row, for each block.
      .attr("transform", function(d, i) { 
        return "translate(0," + y(abbrevsSorted[i]) + ")";
      });

  // Draws the bars.
  bar.append("rect")
      .attr("width", function(d, i) { 
        return  x(percentagesArray[i]);           
      })
      .attr("height", y.rangeBand())
      .style("fill", function(d,i) { 
        //console.log(d.party);
        return blockColors[abbrevsSorted[i]]; 
      });
      /*
      .on("mouseover", function(d) {
          return tooltip.style("visibility", "visible");
      })
      // Display the block's full name when the cursor is hovered above.
      .on("mousemove", function(d, i) {
          return tooltip.style("top", (d3.event.pageY-10)+"px")
                        .style("left",(d3.event.pageX+10)+"px")
                        .text( d.party )
                        .style("font-weight", "bold")
                        .style("font-size", "20px");
      })
      .on("mouseout", function(d) {
          return tooltip.style("visibility", "hidden");  
      });
      */
  


  // Drawing the percentage at the end of the bars.
  bar.append("text")
      .attr("class", "value")
      .attr("x", function(d, i) { 
        //console.log(x(d[year])); 
        return x(percentagesArray[i]); 
      })
      .attr("y", y.rangeBand() / 2)
      .attr("dx", function(d) { 
        //console.log(d[year]);
        return -3;
      })                                 
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d, i) { 

        // Don't display the value zero.
        if(percentagesArray[i] > 0){

          // Round to one decimal.
          var percentage = Math.round( percentagesArray[i] * 10 ) / 10;

          return percentage + "%";
        }else{
          return "";
        }

      })
      .style("font-weight", "bold")
      .style("font-size", "10px");

  // Adding the x-axis.
  svg1.append("g")
      .style("font-weight", "bold")
      .style("font-size", "18px")
      .attr("class", "x axis")
      // Grey color.
      .style("fill", function(d,i) { return "#808080"; })
      .call(xAxis);
      // Add a label.
      /*.append("text")
      .style("font-size", "35px")
      .attr("x", w/2)
      .attr("y", 0)
      .text("Röster (%)")          // The label.
      .attr("text-anchor", "end");  // The text stops at the end of the axis.
      */
  // Adding the y-axis.
  svg1.append("g")
      .attr("class", "y axis")
      //.style("font-weight", "bold")
      .style("font-size", "21px")
      .transition()
      .duration(450)
      .call(yAxis);
      // Add a label.
      /*.append("text")
      .style("font-size", "35px")
      .attr("transform", "rotate(-90)")
      .attr("x", 0)
      .attr("y", 0)
      .text("Parti")          // The label.
      .attr("text-anchor", "end");  // The text stops at the end of the axis.
      */

  }

  function calculateBlocks(chosenCityStats){
      // Get the nr of political parties.
    var nrPoliticalParties = citiesArray[0].values.length;
    var redPercentage = bluePercentage = theRestPercentage = 0;

    // Calculate the percentage for each block.
    var redBlock = ["Socialdemokraterna", "Vänsterpartiet", "Miljöpartiet"];
    var blueBlock = ["Moderaterna", "Folkpartiet", "Centerpartiet", "Kristdemokraterna"];
    var theRest = ["Sverigedemokraterna", "övriga partier", "ej röstande", "ogiltiga valsedlar"];

    for(var idx = 0; idx < nrPoliticalParties; idx++){    
      
      // If the party belongs to the red block.
      for(idu in redBlock){
        if(chosenCityStats[idx].party === redBlock[idu]){
          redPercentage += chosenCityStats[idx][year];
        }
      }      

      // If the party belongs to the blue block.
      for(idu in blueBlock){
        if(chosenCityStats[idx].party === blueBlock[idu]){
          bluePercentage += chosenCityStats[idx][year];
        }      
      }      

      // If the party belongs to the rest.
      for(idu in theRest){
        if(chosenCityStats[idx].party === theRest[idu]){
          theRestPercentage += chosenCityStats[idx][year];
        }      
      }    
    }


    var blockColors = 
    {
      "Rödgröna":"#ff2020",
      "Alliansen":"#52bdec",  
      "Övriga":"#000000", 
    };

    var percentages = 
    [
      {block: "Rödgröna", percentage: redPercentage},
      {block: "Alliansen", percentage: bluePercentage},
      {block: "Övriga", percentage: theRestPercentage}
    ];

    var sorted = percentages.slice(0).sort(function(a, b) {
     return b.percentage - a.percentage;
    });

    
    // Sort the array according to the percentage value, so
    // that this order will have the same order as the array "percentagesArray".
    var abbrevsSorted = [];
    for (var i = 0, len = sorted.length; i < len; ++i) {
        abbrevsSorted.push(sorted[i].block);
        // Set the domain for the y-axis.
    y.domain(abbrevsSorted);
    }

    // Clear the domain.
    svg1.select(".y.axis").remove();

    

    

    // Change the y-axis.
    svg1.select(".y.axis")
        .call(yAxis);

    //------------------------------------------------

    // Get the nr of blocks.
    var nrBlocks = 3;
    var blocksAbbrevArray = [];

    var percentagesArray = [redPercentage, bluePercentage, theRestPercentage];

    // Sort the array that contains the percentages.
    percentagesArray.sort(function(a, b){return b - a}); 

    // Set the scale domain for the x-axis.
    x.domain([0, d3.max(percentagesArray, function(d) { return d; })]); 

    // Clear the domain.
    svg1.select(".x.axis").remove();   

    // Change the y-axis.
    svg1.select(".x.axis")
        .call(xAxis);

    draw(percentages, percentagesArray, abbrevsSorted);

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
    svg1.select(".y.axis").remove();

    // Change the y-axis.
    svg1.select(".y.axis")
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
    svg1.selectAll("g.bar").remove();

    // Save the information about the percentage of the votes
    // for each party, in the chosen city.
    var chosenCityStats = chosenCityObject.values;

    
    calculateBlocks(chosenCityStats); 

  }

}