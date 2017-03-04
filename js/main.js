var bc1, bc2, map1;

var partyAbbreviations = 
{
	"Moderaterna":"Moderaterna", 
	"Folkpartiet":"Liberalerna",
	"Centerpartiet":"Centerpartiet", 
	"Kristdemokraterna":"Kristdemokraterna",	
	"Socialdemokraterna":"Socialdemokraterna",
	"Vänsterpartiet":"Vänsterpartiet", 
	"Miljöpartiet":"Miljöpartiet", 
	"Sverigedemokraterna":"Sverigedemokraterna",  
	"övriga partier":"Övriga partier", 
	"ej röstande":"Ej röstande", 
	"ogiltiga valsedlar":"Ogiltiga valsedlar"
};

var partyColors = 
	{
		"Moderaterna":"#52bdec", 
		"Folkpartiet":"#3399FF",
		"Centerpartiet":"#009933", 
		"Kristdemokraterna":"#000077",	
		"Socialdemokraterna":"#ff2020",
		"Vänsterpartiet":"#c80000", 
		"Miljöpartiet":"#83CF39", 
		"Sverigedemokraterna":"#DDDD00",  
		"övriga partier":"#A9A9A9", 
		"ej röstande":"#000000", 
		"ogiltiga valsedlar":"#696969"
	};

// Read the comma separated file.
d3.csv("data/Swedish_Election_2014.csv", function(error, data){
	bc1 = new barchart1(data, partyAbbreviations, partyColors);
	bc2 = new barchart2(data, partyAbbreviations, partyColors);
	map1 = new map(data);
});

// Calls all of the highlight functions in each js-file.
// Called when the search bar's button has been clicked on.
function selectComponents() {

	// Getting the text from the search bar.
	var searchedRegionString = document.getElementById("searchbar").value;

	bc1.showSelectedRegionStats(searchedRegionString);
    bc2.showSelectedRegionStats(searchedRegionString);
    map1.highlightSelectedRegion(searchedRegionString);
}



