
class LeftView extends BasicView {

    constructor(container) {
        super(container);

        this.dataManager = new LeftViewData();

        this.margin = { 'left': 200, 'right': 20, 'top': 20 };
        
        subscribe('data', this.setData.bind(this));
    }

    init() {
        super.init();

        d3.select("#main_view_panel").html("");

        //add canvas 
        this.svg = d3.select('#main_view_panel')
            .append('svg')
            .attr('width', this.width)
            .attr("height", this.height);
        //binding the user event
        //this.bindingEvent();
    }

    
    draw() {
        this.init();

        let x = this.margin.left + 100;
        let y = this.margin.top;

        let width = 400;
        let height = 300;
        let padding = 100;

        //draw tsne
        this.tsne_embedding = this.draw_embedding(x, y, width, height, this.dataManager.embedding.tsne);

        //draw PCA
        this.pca_embedding = this.draw_embedding(x + width + padding, y, width, height, this.dataManager.embedding.pca);

        //draw parallel coordinate
        this.parallel_paths = this.draw_parallel_coordinate(x - padding, y + height + padding, width * 2.7, height);


        //add brush event on the tsne view
        function isBrushed(brush_coords, cx, cy) {
                    let x0 = brush_coords[0][0],
                        x1 = brush_coords[1][0],
                        y0 = brush_coords[0][1],
                        y1 = brush_coords[1][1];
                    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
        }

        this.svg.append('g')
            .call(d3.brush().extent([[x, y], [x+width, y+height]])
            .on("end", (event) => {
                let coordinate = event.selection;
                let selects_elements = new Set();

                if (coordinate != null)
                this.tsne_embedding
                    .each((d, i, nodes) => {
                        if (isBrushed(coordinate, +$(nodes[i])[0].getAttribute('cx'), +$(nodes[i])[0].getAttribute('cy'))) {
                            selects_elements.add(i);
                            return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                        } else
                            return 'gray';
                    });
                
                if (!selects_elements.size) {
                    this.tsne_embedding.style('fill', (d, i) => {
                        return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                    });

                    this.pca_embedding.style('fill', (d, i) => {
                        return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                    });

                    this.parallel_paths.style('stroke', (d, i) => {
                        return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                    }).style("opacity", (d, i) => {
                        return 0.5;
                    });
                } else {
                    this.tsne_embedding.style('fill', (d, i) => {
                        if (selects_elements.has(i)) {
                            return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                        } else
                            return 'gray';
                    });

                    this.pca_embedding.style('fill', (d, i) => {
                        if (selects_elements.has(i)) {
                            return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                        } else
                            return 'gray';
                    });

                    this.parallel_paths.style('stroke', (d, i) => {
                        if (selects_elements.has(i)) {
                            return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
                        } else
                            return 'gray';
                    }).style("opacity", (d, i) => {
                        return selects_elements.has(i) ? 0.5 : 0.05;
                    });
                }
                
                 
            }));
            
    }

    draw_embedding(x, y, width, height, data) {
        let x_max, x_min, y_max, y_min; 

        [x_min, x_max] = d3.extent(data, (d) => { return d[0] });
        [y_min, y_max] = d3.extent(data, (d) => { return d[1] });
        
        let x_axis = d3.scaleLinear().domain([x_min , x_max * 1.1]).range([x, x + width]);
        let y_axis = d3.scaleLinear().domain([y_max * 1.1, y_min]).range([y, y + height]);


        this.svg.append('g')
            .attr('class', 'embedding_axis')
            .attr("transform", "translate(0" + ',' + (y+height) + ")")
            .call(d3.axisBottom(x_axis).ticks(10));
        
        this.svg.append('g')
            .attr('class', 'embedding_axis')
            .attr("transform", "translate(" + x + " ,0)")
            .call(d3.axisLeft(y_axis).ticks(10));
        
        return this.svg.append('g')
            .selectAll('.embedding_points')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', (d) => {
                return x_axis(d[0]);
            })
            .attr('cy', (d) => {
                return y_axis(d[1]);
            })
            .attr('r', 3)
            .style('fill', (d, i) => {
                return this.dataManager.labels[i] == 1?"rgb(228,26,28)":"rgb(55,55,55)";
            })
            .style('fill-opacity', (d, i) => {
                return 0.5;
            });
    }

    draw_parallel_coordinate(x, y, width, height) {
        
        let y_axis = {};
        let column = ';'
        for (let i = 0; i < this.dataManager.column_names.length; i++){
            column = this.dataManager.column_names[i];
            y_axis[column] = d3.scaleLinear().domain(d3.extent(this.dataManager.dataset, (d) => {
                return d[i]
            })).range([y+height, y]);
        }

        // Build the X scale -> it find the best position for each Y axis
        let x_axis = d3.scalePoint()
            .range([x, width+x])
            .padding(1)
            .domain(this.dataManager.column_names);

        let columns = this.dataManager.column_names;
        //The path function
        function path(d) {
            return d3.line()(columns.map(function(p, i) { return [x_axis(p), y_axis[p](d[i])]; }));
        }

        // Draw the lines
        let paths = this.svg.append('g')
            .selectAll("myPath")
            .data(this.dataManager.dataset)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", (d, i) => {
                //55,55,55
                //228,26,28
                return this.dataManager.labels[i] == 1 ? "rgb(228,26,28)" : "rgb(55,55,55)";
            })
            .style("opacity", 0.5);

        
          // Draw the axis:
        this.svg.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(this.dataManager.column_names)
            .enter()
            .append("g")
            // I translate this element to its right position on the x axis
            .attr("transform", function (d) { return "translate(" + x_axis(d) + ")"; })
            // And I build the axis with the call function
            .each(function (d) {
                d3.select(this).call(d3.axisLeft(y_axis[d]).ticks(10));
            })
            // Add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", y - 9)
            .text(function (d) {
                return d;
            })
            .style("fill", "black");
        
        return paths;
    }

    setData(msg, data) {
        this.dataManager.setData(data);
        this.draw();
    }
}