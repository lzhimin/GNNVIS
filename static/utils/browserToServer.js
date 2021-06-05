function fetch_data(json) {
    $.ajax({
        url: '/_fetch_data',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(json),
        dataType: 'json',
        success: function (data) {
            publish("data", data);
        }
    });
}

function fetch_labels() {
    $.ajax({
        url: '/_fetch_label',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({}),
        dataType: 'json',
        success: function (data) {
            publish("labels_update", data);
        }
    });
}