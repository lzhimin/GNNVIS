
class LeftViewData {
    
    
    constructor() {

      
    }

    setData(data) {
        this.embedding = data.embedding;
        this.labels = data.labels;
        this.dataset = data.datasets
        this.column_names = data.names

        this.config = data.config;
    }
}