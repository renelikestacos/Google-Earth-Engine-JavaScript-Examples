/*
  Author: René Kopeinig
  Script: WEKA Learning Vector Quantization Clustering for Landsat 8
  Description: Example which demonstrates clustering that implements WEKA Learning Vector Quantization algorithm based on
               T. Kohonen, "Learning Vector Quantization", The Handbook of Brain Theory and Neural Networks, 2nd Edition, MIT Press, 2003, pp. 631-634.
  Version: 0.1
*/

var image = ee.Image('LANDSAT/LC8_L1T/LC80260462017039LGN00')
var region = ee.Geometry.Polygon(image.geometry().getInfo().coordinates);

function cluster(image, area){
  var training = image.sample({
    region: area,
    scale: 30,
    numPixels: 5000})
  // Using LVQ with 10 cluster, learning rate of 1 and 10 epochs
  var clusterer = ee.Clusterer.wekaLVQ(10, 1, 10, true).train(training)
  var result = image.cluster(clusterer);
  return result
}

var result = cluster(image, region)
Map.setCenter(-98.723, 20.228,8)
Map.addLayer(image, {bands: ['B4', 'B3', 'B2'],min:0, max:16000, gamma:0.6}, 'LS8 TOA')
Map.addLayer(result.randomVisualizer())
