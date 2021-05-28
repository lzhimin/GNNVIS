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

    draw_prediction_summary(x, y, width, height) {

        let bar_height = 100;
        let bar_width = 15;
        let padding = 10;

        height = bar_height + padding;

        //y-axis for the label bar chart
        let stackbar_chart_axis = d3.scaleLinear()
            .domain([0, d3.max(this.dataManager.confusionMatrix, (d) => { return d3.sum(d);})])
            .range([0,bar_height]);

        for (let i = 0; i < this.dataManager.confusionMatrix.length; i++){
            let prediction_result = [0, 0];//[0] is correct prediction and [1] is wrong prediction
            for (let j = 0; j < this.dataManager.confusionMatrix[i].length; j++) {
                if (i == j)
                    prediction_result[0] = this.dataManager.confusionMatrix[i][j];
                else
                    prediction_result[1] += this.dataManager.confusionMatrix[i][j];
            }

            //summary prediction bar for each label
            let sum_of_prediction = d3.sum(prediction_result);
            this.svg.append('g').selectAll('.confusionMatrix')
                .data(prediction_result)
                .enter()
                .append('rect')
                .attr('width', bar_width)
                .attr('height', (d) => {
                    return stackbar_chart_axis(d);
                })
                .attr('x', () => {
                    return x + i * bar_width + i * padding;
                })
                .attr('y', (d, index) => {
                    return index == 0 ? (y + bar_height - stackbar_chart_axis(d)) : (y + bar_height - stackbar_chart_axis(sum_of_prediction));
                })
                .style('fill', (d, index) => {
                    return index == 0 ?'#4575b4':'#d73027';
                });
            
            this.svg.append('text')
                .attr('x', () => {
                    return x + i * bar_width + i * padding + bar_width / 2;
                })
                .attr('y', () => {
                    return y + bar_height + padding;
                })
                .text(i)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .style('font-size', '15px');
        }
        
        this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr("transform", "translate(" + x + "," + y + ")")
            .call(d3.axisLeft(stackbar_chart_axis).ticks(5));
        
        //label annoatation
        let annotation_rect_w = 10, annotation_rect_h = 10;
        this.svg.selectAll('.predictionSummaryLabel')
            .data(['correct', 'error'])
            .enter()
            .append('rect')
            .attr('width', annotation_rect_w)
            .attr('height', annotation_rect_h)
            .attr('x', (d, i) => {
                return x + (bar_width + padding) * (3 + i * 3);
            })
            .attr('y', (d, i) => {
                return y - padding * 2;
            })
            .style('fill', (d, index) => {
                return index == 0 ? '#4575b4' : '#d73027';
            });
            //.style('fill-opacity', 0.3);
        
        this.svg.selectAll('.predictionSummaryLabel')
            .data(['correct', 'error'])
            .enter()
            .append('text')
            .attr('x', (d, i) => {
                return x + (bar_width + padding) * (3 + i * 3) + annotation_rect_w * 4;
            })
            .attr('y', (d, i) => {
                return y - padding * 2 + annotation_rect_h/2;
            })
            .text(d => d)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central');
        
        this.svg.append('rect')
            .attr('x', x-40)
            .attr('y', y-30)
            .attr('width', width * 3.3)
            .attr('height', height * 1.4)
            .attr('class', 'layerview_background');
    }
  
    setData(msg, data) {
        this.dataManager.setData(data);
        this.draw();
    }
}