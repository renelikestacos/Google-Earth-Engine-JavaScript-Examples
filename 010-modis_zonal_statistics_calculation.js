/*
  Author: René Kopeinig
  Script: MODIS regional or zonal statistics calculation
  Description: Regional or zonal statistics calculation based on a MODIS Net Primary Productivity
               for MODIS LandCover class 'Mixed forest'
  Version: 0.1
*/

// Feature Collection for area of interest
var fc = ee.FeatureCollection(3513341).filter(ee.Filter.or(ee.Filter.eq('Country','Mexico')));

// MODIS Net Primary Productivity Yearly
var mod17_2001 = ee.Image('MODIS/006/MOD17A3H/2001_01_01').select(0)

// MODIS LandCover Type Yearly
var mod51_2001 = ee.Image('MODIS/051/MCD12Q1/2001_01_01').select(0)

// Masking
var modis_2001_class_1 = mod17_2001.mask(mod51_2001.eq(5))

// Regional/Zonal statistic calculation
function region_stats(input, geom){
  var stats_dictionary = input.reduceRegion({
    // Reducer could be min, max, mean, stdev
    reducer: ee.Reducer.mean(),
    geometry: geom.geometry(),
    scale: 500,
    maxPixels: 1e9

  });
  return stats_dictionary.getInfo();
}

var mean_2001_class = region_stats(modis_2001_class_1, fc)
console.log(['Mexico',mean_2001_class['Npp']])
