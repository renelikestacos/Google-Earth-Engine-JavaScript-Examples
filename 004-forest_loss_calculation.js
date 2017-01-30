/* 
  Author: René Kopeinig
  Script: Forest loss calculation
  Description: Calculation of overall forest loss between 2010 and 2015 for the consecutive years.
  Version: 0.1
*/


// Creating a country mask for Chiapas
var mexico = ee.FeatureCollection('ft:11_TQMPTmBF6jKCt9-jAg5Y_1LvH2q-QfVj6jGzYJ');
var chiapas = mexico.filterMetadata('ADMIN_NAME', 'equals', 'Chiapas');

//MODIS Vegetation Continuous Fields Yearly Global (MOD44B.051)
//Select only first band (Percent_Tree_Cover: Tree cover (%))
var vcf_2010 = ee.Image('MODIS/051/MOD44B/2010_03_06').clip(chiapas).select(0);
var vcf_2011 = ee.Image('MODIS/051/MOD44B/2011_03_06').clip(chiapas).select(0);
var vcf_2012 = ee.Image('MODIS/051/MOD44B/2012_03_05').clip(chiapas).select(0);
var vcf_2013 = ee.Image('MODIS/051/MOD44B/2013_03_06').clip(chiapas).select(0);
var vcf_2014 = ee.Image('MODIS/051/MOD44B/2014_03_06').clip(chiapas).select(0);
var vcf_2015 = ee.Image('MODIS/051/MOD44B/2015_03_06').clip(chiapas).select(0);

//Function to calculate loss from one to another year
function calculate_loss(img1,img2){
  var change = img2.subtract(img1);
  var loss_mask = change.expression(
    'PIXEL <= 0', {
      'PIXEL': change
  });
  var loss = change.multiply(loss_mask);
  return loss.divide(ee.Image(100))
}

//Calculate loss
var loss_2011_2010 = calculate_loss(vcf_2010,vcf_2011)
var loss_2012_2011 = calculate_loss(vcf_2011,vcf_2012)
var loss_2013_2012 = calculate_loss(vcf_2012,vcf_2013)
var loss_2014_2013 = calculate_loss(vcf_2013,vcf_2014)
var loss_2015_2014 = calculate_loss(vcf_2014,vcf_2015)

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
var area_of_loss_hectares_2011_2010 = area_of_loss(loss_2011_2010, chiapas)
var area_of_loss_hectares_2012_2011 = area_of_loss(loss_2012_2011, chiapas)
var area_of_loss_hectares_2013_2012 = area_of_loss(loss_2013_2012, chiapas)
var area_of_loss_hectares_2014_2013 = area_of_loss(loss_2014_2013, chiapas)
var area_of_loss_hectares_2015_2014 = area_of_loss(loss_2015_2014, chiapas)

//Create result list
var result_list = [area_of_loss_hectares_2011_2010, area_of_loss_hectares_2012_2011,
area_of_loss_hectares_2013_2012, area_of_loss_hectares_2014_2013, area_of_loss_hectares_2015_2014];

//Display result list
console.log(result_list)