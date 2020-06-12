var width = 1020;
var height = 960;
var mapBool = false;
var indexGreen = 19; //2018 data for second dataset
var indexRed = 10; //2018 data for first dataset
//svg space for drawing big map
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
//svg space for mini map
var MiniSvg = d3.select("body")
    .append("svg")
    .attr("width", 400)
    .attr("height", 320)
    .attr("transform", "translate(-520,-570)");

var color = d3.scaleThreshold()
            .domain([500, 1000, 1500, 2000, 2500, 3000, 3500, 4000])
            //.domain([250, 500, 1000, 2000, 3000, 4000, 5000,6000])
            .range(d3.schemeOrRd[9]);//d3.schemeOrRd[9] //d3.schemeBlues[9]

console.log(d3.schemeOrRd[9]);
var x = d3.scaleSqrt()
    .domain([0, 5000])
    //.domain([0, 6000])
    .rangeRound([440, 950]);

var parseTime = d3.timeParse("%Y");
var path = d3.geoPath();
let dataset = [];
function addData(x){
    dataset.push(x.slice(1));
}

var promises = [
    d3.json("ca-map.json"),
    d3.json("CACountyNames.json"),
    d3.json("Housing2010.json"),
    d3.json("Housing2011.json"),
    d3.json("Housing2012.json"),
    d3.json("Housing2013.json"),
    d3.json("Housing2014.json"),
    d3.json("Housing2015.json"),
    d3.json("Housing2016.json"),
    d3.json("Housing2017.json"),
    d3.json("Housing2018.json"),
    d3.json("BelowPov2010.json"),
    d3.json("BelowPov2011.json"),
    d3.json("BelowPov2012.json"),
    d3.json("BelowPov2013.json"),
    d3.json("BelowPov2014.json"),
    d3.json("BelowPov2015.json"),
    d3.json("BelowPov2016.json"),
    d3.json("BelowPov2017.json"),
    d3.json("BelowPov2018.json"),
    
]

Promise.all(promises).then(function(d){ready(d);});
function ready(Data) {
    //var data = dataset.slice(0, 1);
    var MapData = Data[0];
    console.log(MapData);
    console.log(Data);
    console.log(d3.min(Data[10], function(d){return +d[0];})); 
    console.log(d3.max(Data[10], function(d){return +d[0];})); 
    // Time
// Time //Slider referenced from https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
  var dataTime = d3.range(0, 9).map(function(d) {
    return new Date(2010 + d, 10, 3);
  });

  var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(300)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(2018, 10, 3))
    .on('end', function(d){
        console.log(d.getFullYear());
        updateMap(d.getFullYear());
        if(GlobalFIPS != ""){
           outlineCounty(GlobalFIPS); 
        }
    });
    
    var gTime = svg.append("g")
    .attr('width', 500)
    .attr('height', 100)
    .attr('fill', 'black')
    .append('g')
    .attr('transform', 'translate(700,450)');
    
    console.log(sliderTime.value());
    gTime.call(sliderTime);
    //console.log(t[0]);
    //var max = d3.max(dataset, function(d){return +d[0];});
    //console.log(max);
    //var MapData = dataset[0];
    var CA = topojson.feature(MapData, MapData.objects.tracs);
    var zoom = d3.zoom()
    .scaleExtent([0.5, 40])
    .translateExtent([[-200, -200], [width + 800, height + 800]])
    .on("zoom", zoomed);

    var tooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

    //console.log(topojson.feature(MapData, MapData.objects.tracs));
    //let temp;

    //let temp;
    let DataIndex = 10; // 2018 data
    var Tracts = svg.append("g")
        .attr("class", "tract")
        .selectAll("path")
        .data(CA.features)
        .enter().append("path")
        .attr("fill", function(d){
            var temp = Data[10].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    //console.log(+d2[0]);
                    return d2;
                }
                else if(d.id.slice(3,9) == "137000"){//tract 135202 no longer exists after 2011. And becomes a new one
                    var arr = [0,0,0];
                    return arr;
                }
                //console.log(d2);
            });

            return color(+temp[0]);
        })
        .attr("stroke", "#000")
        .attr("stroke-opacity", 1.0)
        .attr("stroke-width", 0.1)
        .attr("d",path)
        .on("mouseover", function(d){
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("background", color(100));
        })
        .on("mousemove", function(d){
            tooltip.html(function(b){
                if(mapBool == false){
                var CountyObj = Data[1].find(function(c){
                    if(c[2] == d.id.slice(0, 3)){
                        return c;
                    }
                });
                var TractObj = Data[indexRed].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    return d2;
                    }
                });
                var temp = +TractObj[0];
                var cost = "$"+d3.format(",")(temp);
                //console.log(temp);
                if(temp < 0) cost = "n/a";
                return CountyObj[0] + "<br><br>"+"Avg. Monthly Cost: " + cost;
                }
                else{
                console.log(indexGreen);
                var CountyObj = Data[1].find(function(c){
                    if(c[2] == d.id.slice(0, 3)){
                        return c;
                    }
                });
                var TractObj = Data[indexGreen].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    return d2;
                    }
                });
                var temp = +TractObj[0];
                var PovertyCount = d3.format(",")(temp);
                //console.log(temp);
                return CountyObj[0] + "<br><br>"+"# of Latinx below Poverty Line: " + PovertyCount;                    
                }
            })
                .style("left", (d3.event.pageX + 10) + "px") //position tooltip at mouse position
                .style("top", (d3.event.pageY) + "px");
             })
        .on("mouseout", function(d) {	//make tooltip fade away	
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);
        })
        .on("click", function(d){
            //console.log(d.id.slice(0, 3));
            outlineCounty(d.id.slice(0, 3));
        });
    
    //projection for pre projected map
    var proj = d3.geoIdentity();
    
    //proj.fitExtent([[0,0], [100, 100]]);
    var GlobalFIPS = "";
    function outlineCounty(fips){
        //show minimap "box"
        d3.select("#clipRect").attr("stroke-opacity", 1);
        GlobalFIPS = fips;
        var CountyTracts = CA.features.filter(function(d){
            if(d.id.slice(0, 3) == fips) return d;
        });
        var TractObj = {
            "type":"FeatureCollection",
            "features": CountyTracts
        }
        //console.log(CountyTracts);
        //console.log(TractObj);
        //console.log(CA.features);
        //rest minimap drawing
        reset(prevSelection);
        //outline selected county
        var county = d3.select("#I"+fips);
        county.attr("stroke", "blue");
        county.attr("stroke-opacity", 1);
        county.attr("stroke-width", 1);
        
        //set new geo path for minimap data
        var miniPath = d3.geoPath().projection(proj);
        //drawMiniMap(county.attr("d"));
        var geoObj = topojson.feature(MapData, MapData.objects.counties).features.find(function(d){
            if(d.id == fips) return d;
        });
        //center the drawing somewhere else. to the right of big map
        proj.fitExtent([[0,0], [400, 300]], TractObj);
        Minimap.append("g")
            .attr("class", "CountyTracts")
            .selectAll("path")
            .data(CountyTracts)
            .enter().append("path")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 0.1)
            .attr("clip-path", "url(#rectClip)")
            .attr("fill", function(d){
              var DataIndex;
              if(mapBool == false) DataIndex = indexRed;
              else DataIndex = indexGreen;
              var temp = Data[DataIndex].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    //console.log(+d2[0]);
                    return d2;
                }
                else if(d.id.slice(3,9) == "137000"){//tract 135202 no longer exists after 2011. And becomes a new one
                    var arr = [0,0,0];
                    return arr;
                }
                //console.log(d2);
            });

            return color(+temp[0]);            
            })
            .attr("d", miniPath)
            .on("mouseover", function(d){
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("background", color(100));
        })
        .on("mousemove", function(d){
            tooltip.html(function(b){
                if(mapBool == false){
                var CountyObj = Data[1].find(function(c){
                    if(c[2] == d.id.slice(0, 3)){
                        return c;
                    }
                });
                var TractObj = Data[indexRed].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    return d2;
                    }
                });
                var temp = +TractObj[0];
                var cost = "$"+d3.format(",")(temp);
                //console.log(temp);
                if(temp < 0) cost = "n/a";
                return CountyObj[0] + "<br><br>"+"Avg. Monthly Cost: " + cost;
                }
                else{
                console.log(indexGreen);
                var CountyObj = Data[1].find(function(c){
                    if(c[2] == d.id.slice(0, 3)){
                        return c;
                    }
                });
                var TractObj = Data[indexGreen].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    return d2;
                    }
                });
                var temp = +TractObj[0];
                var PovertyCount = d3.format(",")(temp);
                //console.log(temp);
                return CountyObj[0] + "<br><br>"+"# of Latinx below Poverty Line: " + PovertyCount;                    
                }
            })
                .style("left", (event.clientX + 10) + "px") //position tooltip at mouse position
                .style("top", (event.clientY) + "px");
             })
        .on("mouseout", function(d) {	//make tooltip fade away	
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);
        });
        
        var CountyObj = Data[1].find(function(c){
            if(c[2] == fips){
                return c;
            }
        });
        //console.log(CountyObj);
        //change minimap caption
        d3.select("#MinimapCaption")
            .text(CountyObj[0]+" Census Tracts");
        
        //global var to delete last drawing
        prevSelection = county;
        //county.attr("stroke", color(100));
        //console.log(county.attr("d"));
    }
    //get rid of last minimap drawing and update. also reset zoom/drag
    function reset(prev){
        if(prev != null){
            prev.attr("stroke", "#000");
            prev.attr("stroke-opacity", 0.5);
            prev.attr("stroke-width", 0.5);
            Minimap.call(zoom.transform, d3.zoomIdentity);
        }
        Minimap.selectAll("path").remove().exit();
    }
    
    var prevSelection = null;
    
    var Counties = svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(MapData, MapData.objects.counties).features)
        .enter().append("path")
        .attr("id", function(d){ return "I"+d.id; })
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 0.5)
        .attr("d", path)
        .on("click", function(d){
            console.log(d.id);
            //reset();
        });
    
    //Add minimap group
    var Minimap = MiniSvg.append("g")
        .attr("class", "minimap")
        //.attr("transform", "translate(500,100)");
    //add Minimap "box"
    Minimap.append("rect")
        .attr("id", "clipRect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 400)
        .attr("height", 320)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0);
    
    //holder for minimap text
    svg.append("text")
        .attr("id", "MinimapCaption")
        .attr("x", 700)
        .attr("y", 440)
        .text("");
        
    var GreenBtn = svg.append("rect")
        .attr("x", width-100)
        .attr("y", height/8 + 150)
        .attr("width", 100)
        .attr("height", 50)
        .attr("stroke", "black")
        .attr("stroke-opacity", 0)
        .attr("fill", d3.schemeGreens[9][3]);
    
    svg.append("text")
        .attr("x", width-90)
        .attr("y", height/8 + 180)
        .text("Latinx Poverty");
    
    var RedBtn = svg.append("rect")
        .attr("x", width-100)
        .attr("y", height/8 + 90)
        .attr("width", 100)
        .attr("height", 50)
        .attr("stroke", "black")
        .attr("stroke-opacity", 1)
        .attr("fill", d3.schemeOrRd[9][3]);
    svg.append("text")
        .attr("x", width-90)
        .attr("y", height/8 + 120)
        .text("Housing Cost");
    
    GreenBtn.on("click", function(d){
        if(mapBool == false){
        GreenBtn.attr("stroke-opacity", 1);
        RedBtn.attr("stroke-opacity", 0);
        color.range(d3.schemeGreens[9]);
        color.domain([100, 250, 500, 1000,2000, 3000, 4000, 5000])
        x.domain([0, 6000])
        console.log(indexGreen);
        var fips = "";
        Tracts.transition()
            .duration(3000)
            .ease(d3.easeQuad)
            .attr("fill", function(d){
            var temp = Data[indexGreen].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    //console.log(+d2[0]);
                    return d2;
                }
                else if(d.id.slice(3,9) == "137000"){//tract 135202 no longer exists after 2011. And becomes a new one
                    var arr = [0,0,0];
                    return arr;
                }
                //console.log(d2);
            });

            return color(+temp[0]);
        });
        mapBool = true;
        updateLegend();
        if(GlobalFIPS != "") outlineCounty(GlobalFIPS);
        
        }
    });
    
    RedBtn.on("click", function(d){
        if(mapBool == true){
        RedBtn.attr("stroke-opacity", 1);
        GreenBtn.attr("stroke-opacity", 0);
        color.range(d3.schemeOrRd[9]);
        color.domain([500, 1000, 1500, 2000, 2500, 3000, 3500, 4000])
        x.domain([0, 5000]);
        Tracts.transition()
            .duration(3000)
            .ease(d3.easeQuad)
            .attr("fill", function(d){
            var temp = Data[indexRed].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    //console.log(+d2[0]);
                    return d2;
                }
                else if(d.id.slice(3,9) == "137000"){//tract 135202 no longer exists after 2011. And becomes a new one
                    var arr = [0,0,0];
                    return arr;
                }
                //console.log(d2);
            });

            return color(+temp[0]);
        });
        mapBool = false;
        updateLegend();
        if(GlobalFIPS != "") outlineCounty(GlobalFIPS);
        }
    });
    
    
    
    var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Monthly Housing Cost");

g.append("g")
    .attr("class", "x-axis")
    .style("font", "10px times")
    .call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()).tickFormat(function(d){
    return "$" + d3.format(",")(d);
}))
  .select(".domain")
    .remove();
    
//    var slider = document.getElementById("Slide");
//    slider.addEventListener('mouseup', function(){
//        updateMap(+this.value);
//    });
    //updateMap("2018");    
    //svg.call(zoom);
    function updateMap(x){
        var year = x-2010+2;
        indexRed = year;
        indexGreen = year + 9;
        //console.log(year);
        if(mapBool == false) DataIndex = indexRed;
        if(mapBool == true) DataIndex = indexGreen;
        console.log(DataIndex);
        Tracts.transition()
            .duration(3000)
            .ease(d3.easeQuad)
            .attr("fill", function(d){
            var temp = Data[DataIndex].find(function(d2){
                if(d2[2] == d.id.slice(0,3) && d2[3] == d.id.slice(3,9)){
                    return d2;
                }
                else if(d.id.slice(3,9) == "137000"){//Tract didn't exist before 2012. So i give it a dummy value.
                    var arr = [0,0,0];
                    return arr;
                }
            });
            //console.log(+temp[0]);
            return color(+temp[0]);
        });
    }
    
function updateLegend(){
     //tried to update Legend info
     //http://bl.ocks.org/alansmithy/e984477a741bc56db5a5 used for reference
     //
     //change legend caption
    if(mapBool == false){
        g.selectAll(".caption").text("Monthly Housing Cost");
    }
     else{
        g.selectAll(".caption").text("Number of Latinx People Below the Poverty Line"); 
     }
     g.selectAll("rect").remove(); //remove all drawn rectangles from 'previous' legened
        g.selectAll("rect")
  .data(color.range().map(function(d) {//recompute rectangle strip values
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });
    //redraw tick marks with new domain data with in dollar format or not
    g.select(".x-axis").call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()).tickFormat(function(d){
    if(mapBool == false){
        return "$" + d3.format(",")(d);
    }
    else{
        return d;
    }
})) 
  .select(".domain")
    .remove();
 };  
    MiniSvg.call(zoom);
    //svg.call(zoom) //zoom/drag functionality but it gets laggy.
    function zoomed (){
        tooltip.style("left", (event.clientX + 10) + "px") //position tooltip at mouse position
                .style("top", (event.clientY) + "px");
        Minimap.selectAll("path")
            .attr("transform", d3.event.transform); 
    }
}