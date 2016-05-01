      function tabulate(data, columns) {

            var table = d3.select("body").append("table")
                    .attr("style", "margin-left: 25px"),
                thead = table.append("thead"),
                tbody = table.append("tbody");

            // append the header row
            thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                    .text(function(column) { return column; });

            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(data)
                .enter()
                .append("tr");

            // create a cell in each row for each column
            var cells = rows.selectAll("td")
                .data(function(row) {
                    return columns.map(function(column) {
                        return {column: column, value: row[column]};
                    });
                })
                .enter()
                .append("td")
                .attr("style", "font-family: Courier")
                    .html(function(d) { return d.value; });
            
            return table;
        }
    
      function scatter(dataScat) { 
            // Set the dimensions of the canvas / graph
            var margin = {top: 30, right: 20, bottom: 30, left: 50},
                width = 900 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;
            // Parse the date / time
            var parseDate = d3.time.format("%Y").parse;
            
            // Set the ranges
            var x = d3.time.scale().range([0, width]);
            var y = d3.scale.linear().range([height, 0]);

            // Define the axes
            var xAxis = d3.svg.axis().scale(x)
                .orient("bottom").ticks(16);

            var yAxis = d3.svg.axis().scale(y)
                .orient("left").ticks(5);

            // Define the line
            var valueline = d3.svg.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.count); });
                
            // Adds the svg canvas 
            var svg = d3.select("body")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");
                        
                svg.append("text")
                    .attr("x", (width / 2))             
                    .attr("y", 0 - (margin.top / 2))
                    .attr("text-anchor", "middle")  
                    .style("font-size", "16px") 
                    .style("text-decoration", "underline")  
                    .text("Body Count By Year");
            // Get the data
            d3.tsv("yeardeaths.tsv", function(error, data) {
                data.forEach(function(d) {
                    d.date = parseDate(d.date);
                    d.count = +d.count;
                });
                // Scale the range of the data
                x.domain(d3.extent(data, function(d) { return d.date; }));
                y.domain([0, d3.max(data, function(d) { return d.count; })]);

                // Add the valueline path.
                svg.append("path")
                    .attr("class", "line")
                    .attr("d", valueline(data));             

                // Add the scatterplot
                svg.selectAll("dot")
                    .data(data)
                .enter().append("circle")
                    .attr("r", 3.5)
                    .attr("cx", function(d) { return x(d.date); })
                    .attr("cy", function(d) { return y(d.count); });
                    
                // Add the X Axis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                   .append("text")
                    .attr("class", "label")
                    .attr("x", width)
                    .attr("y", -6)
                    .style("text-anchor", "end")
                    .text("Year");

                // Add the Y Axis
                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                   .append("text")
                    .attr("class", "label")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Body Count");

            });

          
      }
      
      function draw(geo_data) {
        "use strict";
                
        var margin = 75,
            width = 960 - margin,
            height = 1060 - margin;
        
        d3.select("body")
          .append("h2")
          .text("Deaths In Mn with Police Interactions ");
       
        d3.select("body")
          .append("h4")
            .text("NOTE: The highlighted area in map below represents the Twin-Cities Metropolitan Area.");
    
        var svg = d3.select("body")
                    .append("svg")
                    .attr("width", width + margin)
                    .attr("height", height + margin)
                    .append('g')
                    .attr('class', 'map');
        
        //This section finds the optimum size of the geo drawing based on width and height
        var projection = d3.geo.mercator()
                               .scale(1)
                               .translate( [0, 0]);

        var path = d3.geo.path().projection(projection);

        var b = path.bounds(geo_data),
            s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        
        projection
            .scale(s)
            .translate(t);

        var map = svg.selectAll('path')
                     .data(geo_data.features)
                     .enter()
                     .append('path')
                     .attr('d', path)
                     .style('fill', 'lightgray')
                     .style('fill', function(d, i) {
	                        var name = d.properties.name; 
                            if (name == 'Hennepin ' ||
                                name == 'Ramsey ' ||
                                name == 'Dakota ' ||
                                name == 'Scott ' ||
                                name == 'Washington ') {
                                return "lightBlue";
                            } else {
                                return "lightgray";
                            }
	                  })
                     .style('stroke', 'black')
                     .style('stroke-width', 0.5);
                    
                  svg.selectAll("text")
                     .data(geo_data.features)
                     .enter()
                     .append("svg:text")
                     .text(function(d){
                         return d.properties.name;
                     })
                     .attr("x", function(d){
                         return path.centroid(d)[0];
                     })
                     .attr("y", function(d){
                         return  path.centroid(d)[1];
                     })
                     .attr("text-anchor","middle")
                     .attr('font-size','10pt')
                     .attr('fill-opacity', '.5')
                     .attr('fill', 'blue');
                     
        //use leaves and nest to plot the points by year              
        function plot_points(data) {

            var nested = d3.nest()
                           .key(function(d) {
                              return d['DeathDate'];
                           })
                           .rollup(function(leaves) {
                             
                             var total = d3.sum(leaves, function(d) {
                                 return d['count'];
                             });
                             
                             var coords = leaves.map(function(d) {
                               return projection([+d.long, +d.lat]);
                             });
                             
                             var center_x = d3.mean(coords, function(d) {
                               return d[0];
                             });

                            var center_y = d3.mean(coords, function(d) {
                               return d[1];
                             });
                             
                             return {
                               'count' : total, 
                               'x' : center_x, 
                               'y' : center_y
                             };
                             
                           })
                           .entries(data);

            var count_max = d3.max(nested, function(d) {
                return d.values['count'];
            });

            var radius = d3.scale.sqrt()
                           .domain([0, count_max])
                           .range([0, 15]);
             
            function key_func(d) {
                return d['key'];
            }
                                        
            svg.append('g')
               .attr("class", "bubble")
               .selectAll("circle")
               .data(nested)
               .enter()
               .append("circle")
               .attr('cx', function(d) { return d.values['x']; })
               .attr('cy', function(d) { return d.values['y']; })
               .attr('r', 8);
          
          //Add Note for Highlighted area
          d3.select("body")
            .append("h4")
                .text("NOTE: The highlighted area in map above represents the Twin-Cities Metropolitan Area.");
          //Add a simple scatterplot to show trend over time
          var yearTrend = scatter(data);
          //Select the features from the tsv to be put in the table. 
          var peopleTable = tabulate(data, ["DeathDate", "FirstName", "LastName", "Race", "StribNarrative", "photo"]);
          
          function update(year) {
              var filtered = nested.filter(function(d) {
                  return new Date(d['key']).getUTCFullYear() === year;
              });
              
              d3.select("h2")
                .text("Deaths In Mn with Police Interactions  " + year);
                
              var circles = svg.selectAll('circle')
                               .data(filtered, key_func);

              circles.exit().remove();

              circles.enter()
                     .append("circle")
                     .transition()
                     .duration(500)
                      .attr('cx', function(d) { return d.values['x']; })
                      .attr('cy', function(d) { return d.values['y']; })
                      .attr('r', 8);
                      
              svg.selectAll('path')
                 .transition()
                 .duration(500);  
   
          }      
          
          var years = [];

          for(var i = 2000; i < 2017; i += 1) {
              years.push(i);
          }
          var year_idx = 0;

          var year_interval = setInterval(function() {
            update(years[year_idx]);

            year_idx++;

            if(year_idx >= years.length) {
                clearInterval(year_interval);
                
                var buttons = d3.select("body")
                        .append("div")
                        .attr("class", "years_buttons")
                        .selectAll("div")
                        .data(years)
                        .enter()
                        .append("div")
                        .text(function(d) { return d; });
                 
                 buttons.on("click", function(d) {
                   d3.select(".years_buttons")
                     .selectAll("div")
                     .transition()
                     .duration(500)
                     .style("color", "black")
                     .style("background", "#e7e7e7");      
                
                    d3.select(this)
                      .transition()
                      .duration(500)
                      .style("background", "lightBlue")
                      .style("color", "white");
                                       
                    update(d);
                    
                });       
            }
          }, 1000);
            
        }
        

        var format = d3.time.format("%m/%d/%Y");   
        
        d3.tsv("mn_shootings.tsv", function(d) {
          d['count'] = +d['count']; //+d makes sure this is an integer
          d['DeathDate'] = format.parse(d['DeathDate']); //parse out the date not the whole time 
          return d;
        }, plot_points);
        
      };
      
