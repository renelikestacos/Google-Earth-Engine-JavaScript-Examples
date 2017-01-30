/*
  Author: René Kopeinig
  Description: High forest potential map for the Mexican state of Chiapas according to 
  			   'The Nature Conservancy and Alianza México REDD+'
  			   compared with MODIS Land cover classification 2012's forest classes.
  Version: 0.1
*/

// Creating a mask for chiapas
var mexico = ee.FeatureCollection('ft:11_TQMPTmBF6jKCt9-jAg5Y_1LvH2q-QfVj6jGzYJ');
var chiapas = mexico.filterMetadata('ADMIN_NAME', 'equals', 'Chiapas');

//WHRC Pantropical Biomass
var whrc = ee.Image("WHRC/biomass/tropical").clip(chiapas)

//MODIS Vegetation Continuous Fields Yearly Global (MOD44B.051)
var vcf_2013_treecover = ee.Image('MODIS/051/MOD44B/2013_03_06').clip(chiapas).select(0);

//Masking high potential forest map (According to 'The Nature Conservancy and Alianza México Redd+')
var high_forest_potential = whrc.mask(whrc.gt(120).or(vcf_2013_treecover.gt(85)))
high_forest_potential = high_forest_potential.where(high_forest_potential,1000)

// MODIS LAND COVER 2012 Forest classes
var modis_2012 = ee.Image('MODIS/051/MCD12Q1/2012_01_01').select('Land_Cover_Type_1');
var igbpPalette = [
  '152106', '225129', '369b47', '30eb5b', '387242' // forest classes
];

Map.addLayer(modis_2012.clip(chiapas), {palette: igbpPalette, min: 1, max: 5}, 'MODIS 2012');
Map.addLayer(high_forest_potential,{palette:['4C5F3E']},'High Forest Potential (The Nature Conservancy and Alianza México REDD+)')