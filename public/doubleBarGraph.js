//

function createDoubleBarGraph(firstCity,secondCity){
	url = "./Data/citiesData.json";
	d3.json(url,function(citiesData){
		widthFirst = getWidth(citiesData,firstCity,true);
		widthSecond = getWidth(citiesData,secondCity,false);
		widthFirstPortion = widthFirst/(widthFirst+widthSecond);
		widthSecondPortion = widthSecond/(widthFirst+widthSecond);
		makeDoubleBarGraph(citiesData,firstCity,true,widthFirstPortion);
		makeDoubleBarGraph(citiesData,secondCity,false,widthSecondPortion);
	});

	function makeDoubleBarGraph(citiesData,whichCity,first,widthPortion){

		var height = 2500;
		var width = 600*widthPortion;
		var padding = 60;
		var cityData;

		//looks for city data based on name
		for (var j=0;j<3;j++){
			if (whichCity===citiesData["children"][j]["name"]){
				cityData = citiesData["children"][j];
			}
		}

		//converts data into array of zipcode objects
		cityData = convertCityData(cityData,first);

		//x and y scaling
		var x = d3.scale.linear()
				.domain(d3.extent(cityData, function(d) { return summAll(d.value);}))
				.nice()
				.range([0,width]);
		var y = d3.scale.ordinal()
				.domain(cityData.map(function(d) { return d.name; }))
				.rangeRoundBands([0,height],0.2);

		var color = d3.scale.ordinal()
				.range(["#98abc5","#6b486b","#ff8c00"]);

		//x and y axis
		var xAxis = d3.svg.axis()
				.scale(x)
				.orient("top")
				.ticks(10*widthPortion);
		var svg = d3.select("#doubleBarGraph").append("svg")
			    .attr("width", width)
			    .attr("height", height + padding + padding)
			  	.append("g")
			    .attr("transform", "translate(" + 0 + "," + padding + ")");

		svg.selectAll(".bar")
			.data(cityData)
			.enter()
			.append("rect")
			.attr("x", function(d) { 
				if (first){
					return width;
				}
				else {
					return 0;					
				}
			})
			.attr("y", function(d,i) { 
				return 2+i*12; 
				//return y(d.name); 
			})
			.attr("width", function(d) { 
				return 0;
			})
			//.attr("height", y.rangeBand())
			.attr("height", 10)
			.attr("fill","#1f77b4");

		svg.selectAll("rect")
			.transition()
			.duration(1000)
			.attr("x",function(d){
				if (first){
					return x(Math.min(0, summAll(d.value)));
				}
				else {
					return 0;
				}
			})
			.attr("width",function(d){
				return Math.abs(x(summAll(d.value)) - x(0));
			})


		svg.append("g")
			.attr("class", "x axis")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.append("line")
			.attr("x1", x(0))
			.attr("x2", x(0))
			.attr("y2", height);
	}

	var summAll = function(valueD) {
		return valueD.reduce(function(a,b){return a+b});
	}
	
	var getWidth = function(citiesData,whichCity,first){
		var cityData;
		for (var j=0;j<3;j++){
			if (whichCity===citiesData["children"][j]["name"]){
				cityData = citiesData["children"][j];
			}
		}

		cityData = convertCityData(cityData,first);	

		var summAll = function(valueD) {
			return valueD.reduce(function(a,b){return a+b});
		}

		if (first){
			return Math.abs(d3.extent(cityData, function(d) { return summAll(d.value); })[0]);
		}
		else {
			return Math.abs(d3.extent(cityData, function(d) { return summAll(d.value); })[1]);
		}
	}
	
	var convertCityData = function(cityData,first){
		cityArray = [];
		for (var r=0;r<cityData["children"].length;r++){
			var zipCode = cityData["children"][r]["name"];
			var schoolCompanyFood = [];
			for (var t=0;t<3;t++){
				if (first){
					schoolCompanyFood.push(-1*cityData["children"][r]["children"][t]["size"]);
				}
				else {
					schoolCompanyFood.push(cityData["children"][r]["children"][t]["size"]);
				}
			}
			cityArray.push({
				"name":zipCode,
				"value":schoolCompanyFood
			});
		}
		return cityArray;
	}

}