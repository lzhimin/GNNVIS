
let myLayout = new GoldenLayout(config);

let _left_view;
let _right_view;

myLayout.registerComponent('LeftView', function (container, state) {
    $(container.getElement()[0]).load('../static/LeftView/LeftView.html');
    //program Tree view, subscribe to data event
    _left_view = new LeftView(container);
});

myLayout.registerComponent('RightView', function (container, state) {
    $(container.getElement()[0]).load('../static/RightView/RightView.html');
    //program Tree view, subscribe to data event
    _right_view = new RightView(container);
});

myLayout.on('itemCreated', (item) => {
    if (item.config.cssClass) {
        item.element.addClass(item.config.cssClass);
    }
});

myLayout.init();

fetch_data("");