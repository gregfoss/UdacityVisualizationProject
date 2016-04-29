      function draw(geo_data) {
        "use strict";
        var margin = 75,
            width = 960 - margin,
            height = 1160 - margin;

        var parseDate = d3.time.format("%m/%d/%Y");
        
        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin)
            .attr("height", height + margin)
            .append('g')
            .attr('class', 'map');
       
        var div = d3.select("body").append("div")	
                    .attr("class", "tooltip")				
                    .style("opacity", 0);
                        
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

            svg.selectAll("circle")
               .data(data)
               .enter()
               .append("circle")
               .attr("cx", function(d) {
                return projection([d.long, d.lat])[0];
               })
               .attr("cy", function(d) {
                return projection([d.long, d.lat])[1];
               })
              .attr("r", 7)
              .on("mouseover", function(d) {		
                      div.transition()		
                        .duration(200)		
                        .style("opacity", .9);	
                        	
                     div.html(parseDate(d.DeathDate) + "<br/>" + 
                              d.Race + ' ' + d.Gender + "<br/>" +
                              d.FirstName + ' ' + d.LastName + "<br/>" + 
                              d.StribNarrative + "<br/>" + 
                              d.photo)	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                })					
                .on("mouseout", function(d) {		
                     div.transition()		
                        .duration(500)		
                        .style("opacity", 0);	
                });   
               
                     
        }
        
        var format = d3.time.format("%m/%d/%Y");

        d3.tsv("mn_shootings.tsv", function(d) {
          d['count'] = +d['count'];
          d['DeathDate'] = format.parse(d['DeathDate']);
          return d;
        }, plot_points);
      };
