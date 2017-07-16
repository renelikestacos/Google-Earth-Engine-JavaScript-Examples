/*
  Author: René Kopeinig
  Script: Spectra analysis on Landsat 8 TOA & Proba-V S1 TOC
  Description: Example of spectra analysis on Landsat 8 TOA & Proba-V S1 TOC on features such as agriculture, urban and water 
  Version: 0.1
*/

var ls8 = ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
        .filterDate('2017-01-01', '2017-12-31')
        .filterMetadata('CLOUD_COVER', 'less_than', 10)
        .min()
        .slice(0,8)
var probav = ee.ImageCollection('VITO/PROBAV/C1/S1_TOC_100M')
        .min()
        .slice(0,5)

var hidalgo = ee.FeatureCollection('ft:11_TQMPTmBF6jKCt9-jAg5Y_1LvH2q-QfVj6jGzYJ').filterMetadata('ADMIN_NAME', 'equals', 'Hidalgo');
probav=probav.clip(hidalgo)
ls8=ls8.clip(hidalgo)

Map.setCenter(-98.8934, 20.4716, 8)
//Map.addLayer(probav, {min:0, max:255},'PROBA-V')
Map.addLayer(ls8, {min:0, max:0.2},'LS8_TOA')

function chart_options(title){
 var options = {
  title: title,
  hAxis: {title: 'Bands'},
  vAxis: {title: 'Pixel Values'},
  lineWidth: 1,
  pointSize: 0.25,
  series: {
    0: {color: '00FF00'},
    1: {color: '996633'},
    2: {color: '0000FF'}
  }};
  return options
}

var urban = ee.Geometry.MultiPoint([[-98.76434326171875,20.11063974800624],
[-98.78013610839844,20.09580908197506],[-98.74099731445312,20.073560449523114],
[-98.73172760009766,20.066788499743634],[-98.74580383300781,20.12321247264606]])

var water = ee.Geometry.MultiPoint([[-99.36567306518555,20.15050362250545],
[-99.3684196472168,20.143573840297726],[-99.37116622924805,20.136160244539198],
[-99.37374114990234,20.13003570447512],[-99.38541412353516,20.121493182058764]])

var agriculture = ee.Geometry.MultiPoint([[-98.8388442993164,20.668417753503775],
[-98.8388442993164,20.668417753503775],[-98.83729934692383,20.669542040570413],
[-98.83403778076172,20.675484562510196],[-98.82837295532227,20.67532395686697]])


var points = ee.FeatureCollection([
  ee.Feature(water, {'label': 'Water'}),
  ee.Feature(agriculture, {'label': 'Agriculture'}),
  ee.Feature(urban, {'label': 'Urban'})
]);

var ls8_spectraChart = Chart.image.regions(
    ls8, points, ee.Reducer.mean(), 30, 'label')
        .setChartType('LineChart')
        .setOptions(chart_options('Landsat 8 L1T TOA Spectra for different features'));

var probav_spectraChart = Chart.image.regions(
    probav, points, ee.Reducer.mean(), 30, 'label')
        .setChartType('LineChart')
        .setOptions(chart_options('PROBA-V S1 TOC Spectra for different features'));

// Display the chart.
print(ls8_spectraChart, probav_spectraChart);
