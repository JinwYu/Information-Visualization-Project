function map(data){

	var self = this;

	var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", move);

	var mapDiv = $("#map");

	var toolTip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

	var margin = {top:170, right:20, left:100, bottom:10},
		height = mapDiv.height() + margin.top - margin.bottom,
		width = mapDiv.width() - margin.right + margin.left;

	var projection = d3.geo.mercator()
                    .center([19, 61.6])
                    .scale(1600)
                    .translate([width/2,height/2]);

	var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)
		.call(zoom);

	var path = d3.geo.path()
		.projection(projection);

	var g = svg.append("g");

	var regionParties = [];
	var numberOfParties = [];

	self.data = data;

	// Initialize tooltip.
    // Taken from: http://bl.ocks.org/biovisualize/1016860
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute");


//----------------------------------------------------------------------------
var year = "Year=2014";

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


  var testRegion = "1762 Munkfors";

  //------------------------------------------------

  	// Get the nr of political parties.
  	var nrPoliticalParties = citiesArray[0].values.length;
  	
  	// Used to check which block the party belongs to.
	var redBlock = ["Socialdemokraterna", "Vänsterpartiet", "Miljöpartiet"];
	var blueBlock = ["Moderaterna", "Folkpartiet", "Centerpartiet", "Kristdemokraterna"];
	var theRest = ["Sverigedemokraterna", "övriga partier", "ej röstande", "ogiltiga valsedlar"];

	var winningBlock = [];
	
	// Go throught each city/region.
	citiesArray.map(function(d, i){
		
		var redPercentage = bluePercentage = theRestPercentage = 0;

		// Calculate the percentage for each block.
		for(var idx = 0; idx < nrPoliticalParties; idx++){

			var hasAddedPercentage = false;

			// If the party belongs to the red block.
			if(!hasAddedPercentage){
				for(idu in redBlock){
				  if(d.values[idx].party === redBlock[idu]){
				    redPercentage += d.values[idx][year];
				    hasAddedPercentage = true;
				    // If the party's percentage has been added, break the loop.
				    break;		    
				  }
				}  
			}			    

			// If the party belongs to the blue block.
			if(!hasAddedPercentage){
				for(idu in blueBlock){
				  if(d.values[idx].party === blueBlock[idu]){
				    bluePercentage += d.values[idx][year];
				    hasAddedPercentage = true;	
				    break;
				  }      
				}      
			}

			// If the party belongs to the rest.
			if(!hasAddedPercentage){
				for(idu in theRest){
				  if(d.values[idx].party === theRest[idu]){
				    theRestPercentage += d.values[idx][year];
				    hasAddedPercentage = true;	
				    break;
				  }      
				}
			}    
		}

		// Save the information.
		var percentages = 
		[
			{region: d.key, block: "RÖD", percentage: redPercentage},
			{region: d.key, block: "BLÅ", percentage: bluePercentage},
			{region: d.key, block: "ÖVR", percentage: theRestPercentage}
		];

		// Sort.
		var sorted = percentages.slice(0).sort(function(a, b) {
			return b.percentage - a.percentage;
		});

		// Push the winning block.
		winningBlock.push(sorted[0]);


			
	});
	//console.log(winningBlock[0].region);

	var blockColors = 
  {
    "RÖD":"#ff2020",
    "BLÅ":"#52bdec",  
    "ÖVR":"#000000", 
  };

  


//----------------------------------------------------------------------------

var regionNameList = [];
	d3.json("data/swe_mun.topojson", function(error, swe){
		if(error) throw error;

		var regions = topojson.feature(swe, swe.objects.swe_mun).features;
		//console.log(regions[0]); // Object { type: "Feature", properties: Object, geometry: Object }
		
		// Create a list with all of the names of the regions.
		// Used in the search bar.
		regions.filter(function(d) {
            //var regionNameString = (d.properties.name).toLowerCase();
            regionNameList.push(d.properties.name);
        });

		draw(regions);
	});

	function draw(regions){
		var region = g.selectAll(".region")
					  .data(regions);

		region.enter().insert("path")
			.attr("class", "region")
			.attr("d", path)
			.style("fill", function(d){ 
				var winningBlockColorKey;
				var regionString = d.properties.name;

				for(var idx = 0; idx < winningBlock.length; idx++){

					var tempRegionName = winningBlock[idx].region;
					//console.log(winningBlock[idx].region);

					if(tempRegionName.includes(regionString)){

						// Get the winning block's color.
						winningBlockColorKey = winningBlock[idx].block;

						// Break the loop.
						break;
					}
				}

				return blockColors[winningBlockColorKey]; 
			})
			
			//.style("fill", function(d){ return "#2eb82e";})	// TODO: gör kartan grön från början.
			.attr("stroke-width", 0.4)
            .attr("stroke", "black")
            .on("mouseover", function(d) {
                return tooltip.style("visibility", "visible");
            })
			.on("mousemove", function(d,i) {
				return tooltip.style("top", (d3.event.pageY-10)+"px")
                       .style("left",(d3.event.pageX+10)+"px")
                       .text(d.properties.name)
                       .style("font-weight", "bold")
                       .style("font-size", "20px");			
			})
			.on("mouseout", function(d,i){				
				return tooltip.style("visibility", "hidden");  				
			})
			.on("click", function(d){

				// 
				map1.selFeature(d.properties.name);

				// Clear the previously drawn region name.
				svg.selectAll("text").remove();

				drawSelectedRegionName(d.properties.name);
			});
	}

	function drawSelectedRegionName(selectedRegionString){

		// Clear previously drawn text.
    	d3.select("text").remove();

		// Display the name of the region that is highlighted.
		d3.select("svg").append("text")
			.attr("x", 17 )
			.attr("y", 67)
			.style("text-anchor", "start")
			.style("font-weight", "bold")
			.style("font-size", "60px")
			// Color the text with the winning block's color.
			.style("fill", function(e){

				var winningBlockColorKey;

				for(var idx = 0; idx < winningBlock.length; idx++){
					var tempRegionName = winningBlock[idx].region;

					if(tempRegionName.includes(selectedRegionString)){
						// Get the winning block's color.
						winningBlockColorKey = winningBlock[idx].block;								
						// Break the loop.
						break;
					}
				}
				return blockColors[winningBlockColorKey]; 
			})
			.text(selectedRegionString);
	}


	// Method for selecting features of other components.
    this.selFeature = function(selectedRegionString){
        bc1.showSelectedRegionStats(selectedRegionString);
        bc2.showSelectedRegionStats(selectedRegionString);
        map1.highlightSelectedRegion(selectedRegionString);
    }

    // Highlight the selected countries.
    this.highlightSelectedRegion = function(selectedRegionString){

        // The stroke width for the selected region in the map.
	    var strokeWidthActive = 6.0;
	    var strokeWidthUnactive = 0.4;

        // Reset the highlighted region.
        g.selectAll(".region")
        .style("stroke-width", strokeWidthUnactive);

        g.selectAll(".region")
        // If the region is selected, make the strokes around the region white.
        .attr("stroke", function(d) {

            var active = false;

            if(selectedRegionString.includes(d.properties.name)){ active = true; } 


            if(active) 
                return "white";
            else                                       
                return "black";
        })
        // Change the stroke width if the region is selected.
        .style("stroke-width", function(d) {

            var active = false;

            if(selectedRegionString.includes(d.properties.name)){ active = true; } 


            if(active) 
                return strokeWidthActive;
            else                                       
                return strokeWidthUnactive;
        });

        // Getting the text from the search bar.
		var searchedRegionString = document.getElementById("searchbar").value;
		// Draw the selected region's name.
        drawSelectedRegionName(searchedRegionString);

    };

	function move() {

        var t = d3.event.translate;
        var s = d3.event.scale;        

        zoom.translate(t);
        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");

    }  	
}