
class LeftView extends BasicView {

    constructor(container) {
        super(container);

        this.dataManager = new LeftViewData();

        this.margin = { 'left': 20, 'right': 20, 'top': 20 };
        
        subscribe('data', this.setData.bind(this))
    }

    init() {
        super.init();

        d3.select("#main_view_panel").html("");

        //add canvas 
        this.svg = d3.select('#main_view_panel')
            .append('svg')
            .attr('width', this.width)
            .attr("height", this.height*2);
    
        
        
        //binding the user event
        //this.bindingEvent();
    }

    
    draw() {
        this.init();

        let x_max, x_min, y_max, y_min;
        let x = this.margin.left + 100;
        let y = this.margin.top;
        let width = 500;
        let height = 500; 

        [x_min, x_max] = d3.extent(this.dataManager.embedding, (d) => { return d[0] });
        [y_min, y_max] = d3.extent(this.dataManager.embedding, (d) => { return d[1] });
        
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
        
        this.svg.selectAll('.embedding_points')
            .data(this.dataManager.embedding)
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
                return this.dataManager.labels[i] == 1?"steelblue":"tomato";
            })
            .style('fill-opacity', (d, i) => {
                return this.dataManager.labels[i] == 1?0:0.2;
            });
    }


    setData(msg, data) {
        this.dataManager.setData(data);
        this.draw();
    }
}