// Author: René Kopeinig
// Script: Tasseled Cap Transformation for Landsat 8
// Description: Tasseled Cap Transformation for Landsat 8 based on the 
//              scientfic work "Derivation of a tasselled cap transformation based on Landsat 8 at-satellite reflectance" by
//              M.Baigab, L.Zhang, T.Shuai & Q.Tong (2014). The bands of the output image are the brightness index, 
//              greenness index and wetness index.
// Version: 0.1
var calculateTasseledCap = function (image){
  var b = image.select("B2", "B3", "B4", "B5", "B6", "B7");
  //Coefficients are only for Landsat 8 TOA
	var brightness_coefficents= ee.Image([0.3029, 0.2786, 0.4733, 0.5599, 0.508, 0.1872])
  var greenness_coefficents= ee.Image([-0.2941, -0.243, -0.5424, 0.7276, 0.0713, -0.1608]);
  var wetness_coefficents= ee.Image([0.1511, 0.1973, 0.3283, 0.3407, -0.7117, -0.4559]);
  var fourth_coefficents= ee.Image([-0.8239, 0.0849, 0.4396, -0.058, 0.2013, -0.2773]);
  var fifth_coefficents= ee.Image([-0.3294, 0.0557, 0.1056, 0.1855, -0.4349, 0.8085]);
  var sixth_coefficents= ee.Image([0.1079, -0.9023, 0.4119, 0.0575, -0.0259, 0.0252]);

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
  var wetness = image.expression(
    '(B * WETNESS)',
			{
				'B':b,
				'WETNESS': wetness_coefficents
				}
			);
  var fourth = image.expression(
      '(B * FOURTH)',
        {
          'B':b,
          'FOURTH': fourth_coefficents
          }
        );
  var fifth = image.expression(
      '(B * FIFTH)',
        {
          'B':b,
          'FIFTH': fifth_coefficents
          }
        );
  var sixth = image.expression(
    '(B * SIXTH)',
    {
      'B':b,
      'SIXTH': sixth_coefficents
      }
    );
  brightness = brightness.reduce(ee.call("Reducer.sum"));
	greenness = greenness.reduce(ee.call("Reducer.sum"));
	wetness = wetness.reduce(ee.call("Reducer.sum"));
	fourth = fourth.reduce(ee.call("Reducer.sum"));
	fifth = fifth.reduce(ee.call("Reducer.sum"));
  sixth = sixth.reduce(ee.call("Reducer.sum"));
  var tasseled_cap = ee.Image(brightness).addBands(greenness).addBands(wetness)
                             .addBands(fourth)
                             .addBands(fifth)
                             .addBands(sixth).rename('brightness','greenness','wetness','fourth','fifth','sixth')
  return tasseled_cap;
};

var country_mask = ee.FeatureCollection(3513341).filter(ee.Filter.or(ee.Filter.eq('Country','Mexico')));
var landsat8_collection = ee.ImageCollection('LANDSAT/LC8_L1T_TOA')
        .filterDate('2016-01-01', '2016-04-19')
        .filterMetadata('CLOUD_COVER', 'less_than', 5)
        .filterBounds(country_mask)
var landsat8_tasseled_cap = landsat8_collection.map(calculateTasseledCap);
console.log(landsat8_tasseled_cap.getInfo())
addToMap(landsat8_tasseled_cap,{},'Landsat 8 Tasseled Cap');