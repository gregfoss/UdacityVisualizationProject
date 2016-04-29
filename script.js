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
    
      
      function draw(geo_data) {
        "use strict";
        var margin = 75,
            width = 960 - margin,
            height = 1060 - margin;
        
        d3.select("body")
          .append("h2")
          .text("Deaths In Mn with Police Interactions ");
          
    
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin)
            .append('g')
            .attr('class', 'map');
        
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
                     .style('fill', 'steelBlue')
                     .style('stroke', 'black')
                     .style('stroke-width', 0.5);
                     
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
          d['count'] = +d['count'];
          d['DeathDate'] = format.parse(d['DeathDate']);
          return d;
        }, plot_points);
        
      };
      
