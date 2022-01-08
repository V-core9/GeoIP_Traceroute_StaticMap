
const StaticMaps = require("staticmaps");

const options = {
    width: 600,
    height: 400
};
const map = new StaticMaps(options);

const polyline = {
    coords: [
        [13.399259, 52.482659],
        [13.387849, 52.477144],
        [13.40538, 52.510632]
    ],
    color: '#0000FFBB',
    width: 3
};

createMap = async () => {
    map.addLine(polyline);
    await map.render();
    await map.image.save('my-staticmap-image.png', { compressionLevel: 9 });
};

createMap();