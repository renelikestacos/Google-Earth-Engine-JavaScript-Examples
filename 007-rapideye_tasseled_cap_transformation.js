/* 
  Author: René Kopeinig
  Script: Tasseled Cap Transformation for RapidEye Imagery
  Description: Tasseled Cap Transformation for RapidEye Imagery based on the 
               scientfic work "Derivation of Tasseled Cap Coefficients for RapidEye data" by 
               M.Schoenert, H.Weichelt, E.Zillmann & C.Jürgens (2014). The bands of the output image are the brightness index,
               greenness index and yellowness index. 
               Link to publication: https://www.researchgate.net/publication/270302804_Derivation_of_Tasseled_Cap_Coefficients_for_RapidEye_data
               Note: You might not be able to see the RapidEye scene because of license issues
               but feel free to use my code on your RapidEye scene(s).
  Version: 0.1
*/


var rapid_eye_scene = ee.Image("users/renekope/1648306_2015")
Map.addLayer(rapid_eye_scene, {min:0, max:16000, bands:'b3, b2, b1'}, "RapidEye Scene 2015")
Map.setCenter(-88.9511, 20.0753,12)

var calculateTasseledCap = function (image){
  var b = image.select("b1", "b2", "b3", "b4", "b5");
  //Coefficients are only for RapidEye Imagery
  var brightness_coefficents = ee.Image([0.2435,0.3448,0.4881,0.4930,0.5835])
  var greenness_coefficents = ee.Image([-0.2216,-0.2319,-0.4622,-0.2154,0.7981])
  var yellowness_coefficents = ee.Image([-0.7564,-0.3916,0.5049,0.1400,0.0064])

  var brightness = image.expression(
      '(B * BRIGHTNESS)',
      {
        'B':b,
        'BRIGHTNESS': brightness_coefficents
        }
      );
  var greenness = image.expression(
    '(B * GREENNESS)',
      {
        'B':b,
        'GREENNESS': greenness_coefficents
        }
      );
  var yellowness = image.expression(
    '(B * WETNESS)',
      {
        'B':b,
        'WETNESS': yellowness_coefficents
        }
      );
      
  brightness = brightness.reduce(ee.call("Reducer.sum"));
  greenness = greenness.reduce(ee.call("Reducer.sum"));
  yellowness = yellowness.reduce(ee.call("Reducer.sum"));
  var tasseled_cap = ee.Image(brightness).addBands(greenness).addBands(yellowness).rename('brightness','greenness','yellowness')
  return tasseled_cap;
};

var rapid_eye_tasseled_cap_transformation = calculateTasseledCap(rapid_eye_scene)
Map.addLayer(rapid_eye_tasseled_cap_transformation.select(2),{min:-4000, max:-1000},'RapidEye Tasseled Cap Transformation Yellowness')
Map.addLayer(rapid_eye_tasseled_cap_transformation.select(1),{min:-4000, max:4000},'RapidEye Tasseled Cap Transformation Greenness')
Map.addLayer(rapid_eye_tasseled_cap_transformation.select(0),{min:6000, max:17000},'RapidEye Tasseled Cap Transformation Brightness')