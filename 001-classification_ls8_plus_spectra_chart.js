// Author: René Kopeinig
// Script: Classification Example for Landsat8 plus spectra for classes in classified region
// Version: 0.1

var area = ee.FeatureCollection('ft:1ihcmnTQF2dUYTKXOIYYwYlJzFLSpO7zsIxg0Yqd5');
var landsat8_collection = ee.ImageCollection('LANDSAT/LC8_L1T').filterDate('2016-01-01', '2016-04-19').min().clip(area);
var madmex = ee.Image("users/renekope/MEX_LC_2010_Landsat_v43")

//Functions
function NDVI(img) { return img.normalizedDifference(["B5","B4"]); };
function SAM(img){
  var band1 = img.select("B1")
  var bandn = img.select("B2","B3","B4","B5","B6","B7","B8","B9");
  var maxObjSize = 256;
  var b = band1.divide(bandn);
  var spectralAngleMap = b.atan();
  var spectralAngleMap_sin = spectralAngleMap.sin();
  var spectralAngleMap_cos = spectralAngleMap.cos();
  var sum_cos = spectralAngleMap_cos.reduce(ee.call("Reducer.sum"));
  var sum_sin = spectralAngleMap_sin.reduce(ee.call("Reducer.sum"));
  var bundle = ee.Image.cat(sum_sin, sum_cos, spectralAngleMap_sin, spectralAngleMap_cos);
  return bundle;
};
function EVI(img){
  var g = ee.Image(2.5);
    var e1 = ee.Image(6);
    var e2 = ee.Image(7.5);
    var e3 = ee.Image(1);
    var nir = img.select("B5");
    var red = img.select("B4");
    var blue = img.select("B2");
    var evi = img.expression(
      "G*((NIR-RED)/(NIR+E1*RED-E2*BLUE+E3))", 
      {
        "G":g,
        "NIR":nir,
        "RED":red,
        "E1":e1,
        "E2":e2,
        "BLUE":blue,
        "E3":e3
        }
      );
    return evi;
};
function ARVI(img){
  var red = img.select("B4");
    var blue = img.select("B2");
    var nir = img.select("B5");
    var tred = red.multiply(red);
    var arvi = img.expression(
        "NIR - (TRED - BLUE)/(NIR+(TRED-BLUE))",{
          "NIR": nir,
    			"TRED": tred,
    			"BLUE": blue
    		}
		);
    return arvi;
};
function LAI(img){
  var nir = img.select("B5");
  var red = img.select("B4");
  var coeff1 = ee.Image(0.0305);
  var coeff2 = ee.Image(1.2640);
  var lai = img.expression("(((NIR/RED)*COEFF1)+COEFF2)",
  {
    "NIR":nir,
    "RED":red,
    "COEFF1":coeff1,
    "COEFF2":coeff2
  });
  return lai;
};

function calculate_spectral_indices(input){
  var ndvi = NDVI(input);
  var sam = SAM(input);
  var lai = LAI(input);
  var arvi = ARVI(input);
  var evi = EVI(input);
  input = input.slice(0,9);
  var spctrl_indices_stack = ee.Image(ndvi).addBands(input).addBands(lai).addBands(sam).addBands(arvi).addBands(evi);
  return spctrl_indices_stack 
};

function classification(raster_input, vector_input, number_of_training_points, cover, class_algorithm){
  var band_list = raster_input.bandNames();
  for (var i = 0; i < number_of_training_points.length; i++) {
    var random_points = ee.FeatureCollection.randomPoints(vector_input, number_of_training_points[i], number_of_training_points[i], 1);
    var training = cover.addBands(raster_input).reduceToVectors({
      reducer: "mean",
      geometry: random_points,
      geometryType: "centroid",
      scale: 30, 
      crs: "EPSG:4326"});
  
    var classifier = training.trainClassifier({
      property_list: band_list,
      class_property: "label",
      classifier_name: class_algorithm});
    var out = raster_input.classify(classifier);
    return out;
  }
}
var sld = '<RasterSymbolizer>\
                        <ColorMap>\
                            <ColorMapEntry color="#005100" label="[1] Bosque de Ayarin; Cedro"  quantity="1"/>\
                            <ColorMapEntry color="#007e00" label="[2] Bosque Encino(-Pino); Matorral Subtropical"  quantity="2"/>\
                            <ColorMapEntry color="#003c00" label="[3] Bosque de Pino (-Encino); Abies; Oyamel; Tascate; Matorral de Coniferas"  quantity="3"/>\
                            <ColorMapEntry color="#aaaa00" label="[4] Matorral Submontano; Mequital Tropical; Bosque Mezquital"  quantity="4"/>\
                            <ColorMapEntry color="#aa8000" label="[5] Bosque de Mezquite; Matorral Desertico Microfilo; Mezquital Desertico; Vegetacion de Galeria"  quantity="5"/>\
                            <ColorMapEntry color="#8baa00" label="[6] Chaparral"  quantity="6"/>\
                            <ColorMapEntry color="#ffb265" label="[7] Matorral Crasicaule"  quantity="7"/>\
                            <ColorMapEntry color="#00d900" label="[8] Bosque Mesofilo de Montana; Selva Baja Perennifolio"  quantity="8"/>\
                            <ColorMapEntry color="#aa007f" label="[9] Selva Baja (Sub)Caducifolia; Espinosa (Caducifolia); Palmar Inducido"  quantity="9"/>\
                            <ColorMapEntry color="#ff55ff" label="[10] Selva Baja y Mediana (Espinosa) Subperennifolia; Selva de Galeria; Palmar Natural"  quantity="10"/>\
                            <ColorMapEntry color="#ff557f" label="[11] Selva Alta Subperennifolia"  quantity="11"/>\
                            <ColorMapEntry color="#ff007f" label="[12] Selva Alta y Mediana Perennifolia"  quantity="12"/>\
                            <ColorMapEntry color="#ff55ff" label="[13] Selva Mediana (Sub) Caducifolia"  quantity="13"/>\
                            <ColorMapEntry color="#aaffff" label="[14] Tular"  quantity="14"/>\
                            <ColorMapEntry color="#00ffff" label="[15] Popal"  quantity="15"/>\
                            <ColorMapEntry color="#55aaff" label="[16] Manglar; Vegetacion de Peten"  quantity="16"/>\
                            <ColorMapEntry color="#e29700" label="[17] Matorral Sarco-Crasicaule"  quantity="17"/>\
                            <ColorMapEntry color="#bd7e00" label="[18] Matorral Sarco-Crasicaule de Neblina"  quantity="18"/>\
                            <ColorMapEntry color="#966400" label="[19] Matorral Sarcocaule"  quantity="19"/>\
                            <ColorMapEntry color="#a2ecb1" label="[20] Vegetacion de Dunas Costeras"  quantity="20"/>\
                            <ColorMapEntry color="#c46200" label="[21] Matorral Desertico Rosetofilo"  quantity="21"/>\
                            <ColorMapEntry color="#aa5500" label="[22] Matorral Espinosa Tamaulipeco"  quantity="22"/>\
                            <ColorMapEntry color="#6d3600" label="[23] Matorral Rosetofilo Costero"  quantity="23"/>\
                            <ColorMapEntry color="#00aa7f" label="[24] Vegetacion de Desiertos Arenos"  quantity="24"/>\
                            <ColorMapEntry color="#008a65" label="[25] Vegetacion Halofila Hidrofila"  quantity="25"/>\
                            <ColorMapEntry color="#005941" label="[26] Vegetacion Gipsofila Halofila Xerofila"  quantity="26"/>\
                            <ColorMapEntry color="#e9e9af" label="[27] Pastizal y Sabana"  quantity="27"/>\
                            <ColorMapEntry color="#faff98" label="[28] Agricultura"  quantity="28"/>\
                            <ColorMapEntry color="#00007f" label="[29] Agua"  quantity="29"/>\
                            <ColorMapEntry color="#c7c8bc" label="[30] Sin y Desprovisto de Vegetacion"  quantity="30"/>\
                            <ColorMapEntry color="#4d1009" label="[31] Urbana"  quantity="31"/>\
                            <ColorMapEntry color="#000000" label="[98] Sombras"  quantity="98"/>\
                            <ColorMapEntry color="#fef7ff" label="[99] Nubes"  quantity="99"/>\
                            <ColorMapEntry color="#6daa50" label="[100] Bosque secondario"  quantity="100"/>\
                            <ColorMapEntry color="#3a7500" label="[123] Bosque Inducido; Cultivado; de Galeria"  quantity="123"/>\
                            <ColorMapEntry color="#0b5923" label="[124] Bosque de Pino-Encino; Matorral de Coniferas"  quantity="124"/>\
                            <ColorMapEntry color="#ffaaff" label="[200] Selva perennifolia secundaria"  quantity="200"/>\
                            <ColorMapEntry color="#ffd1fa" label="[210] Selva caducifolia secundaria"  quantity="210"/>\
                        </ColorMap>\
                    </RasterSymbolizer>';

var spectral_indices = calculate_spectral_indices(landsat8_collection);
var classification = classification(spectral_indices, area, [1000], madmex, 'Cart');
addToMap(classification.sldStyle(sld), {}, "Classification with Landsat 8 and MAD-Mex 2010 training dataset")

function calculate_spectra_chart_classficiation(classifiedImage, inputImage, fusionTable){
  var classNames = ee.List(['Agua', 'Bosque', 'Matorral', 'Agricultura', 'Urbana', 'Selva', 'Otro Vegetation', 'Otro']);
  var from = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 98, 99, 100, 123, 124, 200, 210];
  var to = [1, 1, 1, 2, 1, 4, 2, 1, 5, 5, 5, 5, 5, 6, 6, 7, 2, 2, 2, 6, 2, 2, 2, 6, 6, 6, 6, 3, 0, 4, 4, 7, 7, 1, 1, 1, 5, 5];
  classifiedImage = classifiedImage
        .remap(from, to);
  var input = inputImage.slice(0,8);
  var image = input.addBands(classifiedImage);
  var wavelengths = [0.44, 0.48, 0.56, 0.65, 0.86, 1.61, 2.1, 2.5];
  var options = {
    lineWidth: 1,
    pointSize: 2,
    hAxis: {title: 'Wavelength (micrometers)'},
    vAxis: {title: 'Reflectance'},
    title: 'Spectra for classes in classified region',
    series: {
    0: {color: '00FF00'}, //bosque
    1: {color: 'faff98'}, // agriculture
    2: {color: 'aa007f'}, // selva
    3: {color: 'aa8fff'} // otro vegetacion
    }
  };
  var chart = Chart.image.byClass(
      image, 'remapped', fusionTable, ee.Reducer.mean(), 500, classNames, wavelengths)
      .setOptions(options);
  print(chart);
};
calculate_spectra_chart_classficiation(classification, landsat8_collection, area);