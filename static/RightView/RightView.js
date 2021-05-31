class RightView extends BasicView {

    constructor(container) {
        super(container);

        this.dataManager = new RightViewData();

        this.architecture = {};

        subscribe('modelsummary', this.setData.bind(this))

    }

    init() {

        super.init();

        //clean the panel
        d3.select("#network_architecture_panel").html("");

        //add svg 
        this.svg = d3.select('#network_architecture_panel')
            .append('svg')
            .attr('width', this.width)
            .attr("height", 1800);
        
        //margin

        this.margin.left = 100;
        this.margin.top = 50;
        
        // construct data for each neural network layer
        let layer_names = Object.keys(this.dataManager.data);
        for (let i = 0; i < layer_names.length; i++){
            this.architecture[layer_names[i]] = new LayerView(layer_names[i], this.dataManager.data[layer_names[i]], this.svg)
            this.architecture[layer_names[i]].setActivation_pattern(this.dataManager.activation_pattern[layer_names[i]]);
        }


        //dataset 
        let colordomain = Array.from(new Set(this.dataManager.embedding_labels))
        this.colormap = d3.scaleOrdinal().domain(colordomain).range(d3.schemeSet3);
   }

    draw() {
        this.init();

        //draw the network architecture
        let x = this.margin.left;
        let y = this.margin.top;
        let width = 120;
        let height = 120;
        let padding = 130;

        //draw input data distribution
        let input_width = 300;
        let input_height = 150;
        this.draw_input_summary(x-50, y, input_width, input_height, this.dataManager.input_summary);

        //draw innere layer
        let layer_names = Object.keys(this.dataManager.data);
        for (let i = 0; i < layer_names.length; i++){
            let key = layer_names[i];

            this.architecture[key].setlocation(x, y + (height + padding) * i + input_height+ padding);
            this.architecture[key].setScale(width, height);
            this.architecture[key].draw();
        }

        //draw output prediction
        this.draw_prediction_summary(x-width/4, y + (height + padding) * (layer_names.length) + input_height + padding, width, height);
       
    }

    redraw() {
        //draw the network architecture
        let x = this.margin.left;
        let y = this.margin.top;

        let layer_names = Object.keys(this.dataManager.data);
        for (let i = 0; i < layer_names.length; i++){
            this.architecture[layer_names[i]].redraw();
        }
    }

    draw_input_summary(x, y, width, height, data) {
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
        
        this.svg.selectAll('.embedding_points')
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
                return this.colormap(this.dataManager.embedding_labels[i])
            });
    }
  
    setData(msg, data) {
        this.dataManager.setData(data);
        this.draw();
    }
}