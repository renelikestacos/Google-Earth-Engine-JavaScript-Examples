/*
  Author: rkope
  Description: Calculation of loss in class 'Mixed Forest' 
               based on the MODIS Land cover classification 2012 between 2012 and 2015 for the consecutive years.
  Version: 0.1
*/

// Creating a country mask for chiapas
var mexico = ee.FeatureCollection('ft:11_TQMPTmBF6jKCt9-jAg5Y_1LvH2q-QfVj6jGzYJ');
var chiapas = mexico.filterMetadata('ADMIN_NAME', 'equals', 'Chiapas');

// MODIS LAND COVER 2012
var modis_2012 = ee.Image('MODIS/051/MCD12Q1/2012_01_01').select('Land_Cover_Type_1');
var igbpPalette = [
  'aec3d4', // water
  '152106', '225129', '369b47', '30eb5b', '387242', // forest
  '6a2325', 'c3aa69', 'b76031', 'd9903d', '91af40',  // shrub, grass
  '111149', // wetlands
  'cdb33b', // croplands
  'cc0013', // urban
  '33280d', // crop mosaic
  'd7cdcc', // snow and ice
  'f7e084', // barren
  '6f6f6f'  // tundra
];

Map.addLayer(modis_2012.clip(chiapas), {palette: igbpPalette, min: 0, max: 17}, 'MODIS 2012');
Map.setCenter(-92.5406, 16.4677, 8)

//MODIS Vegetation Continuous Fields Yearly Global (MOD44B.051)
//Select only first band (Percent_Tree_Cover: Tree cover (%))
var vcf_2012 = ee.Image('MODIS/051/MOD44B/2012_03_05').clip(chiapas).select(0);
var vcf_2013 = ee.Image('MODIS/051/MOD44B/2013_03_06').clip(chiapas).select(0);
var vcf_2014 = ee.Image('MODIS/051/MOD44B/2014_03_06').clip(chiapas).select(0);
var vcf_2015 = ee.Image('MODIS/051/MOD44B/2015_03_06').clip(chiapas).select(0);

//Function to calculate loss from one to another year
//taking in consideration a specific modis landcover class
function calculate_loss(img1,img2,class_lc){
  var change = img2.subtract(img1);
  var loss_mask = change.expression(
    'PIXEL <= 0 && MODIS == CLASS', {
      'PIXEL': change,
      'MODIS': modis_2012,
      'CLASS': class_lc
  });
  var loss = change.multiply(loss_mask);
  return loss.divide(ee.Image(100))
}
// Class Mixed Forest (5)
var lc_class = 5;

//Calculate loss
var loss_2013_2012 = calculate_loss(vcf_2012,vcf_2013, lc_class)
var loss_2014_2013 = calculate_loss(vcf_2013,vcf_2014, lc_class)
var loss_2015_2014 = calculate_loss(vcf_2014,vcf_2015, lc_class)


// Function to calculate the area of the loss in hectares
function area_of_loss(img, ft){
  var area = img.multiply(ee.Image.pixelArea());
  var statistics = area.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: ft,
    maxPixels: 5e9
  });
  var area_loss_object = statistics.get('Percent_Tree_Cover');
  var area_loss = area_loss_object.getInfo()
  return area_loss/-10000
}

// calculate the area of the loss
var area_of_loss_hectares_2013_2012 = area_of_loss(loss_2013_2012, chiapas)
var area_of_loss_hectares_2014_2013 = area_of_loss(loss_2014_2013, chiapas)
var area_of_loss_hectares_2015_2014 = area_of_loss(loss_2015_2014, chiapas)

//Create result list
var result_list = [
area_of_loss_hectares_2013_2012, area_of_loss_hectares_2014_2013, 
area_of_loss_hectares_2015_2014];

//Display result list
console.log(result_list)