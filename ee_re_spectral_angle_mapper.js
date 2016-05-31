// Author: René Kopeinig
// Script: Spectral Angle Mapper
// Version: 0.1

var image = ee.Image("CONABIO/RAPIDEYE/2011-02-27T185859_RE5_3A-NAC_9512122_136955");
addToMap(image, {min:0, max:16000}, "Original RapidEye image", false)
centerMap(-108.91, 27.64, 13)

function spectral_angle_mapper(img){
	var band1 = img.select("B")
	var bandn = img.select("G", "R", "RE", "N");
	var maxObjSize = 256;
	var b = band1.divide(bandn);
	
	var spectralAngleMap = b.atan();
	addToMap(spectralAngleMap, {}, "Spectral Angle Map", false)
	
	var spectralAngleMap_sin = spectralAngleMap.sin();
	addToMap(spectralAngleMap_sin, {}, "Sinus", false)

	var spectralAngleMap_cos = spectralAngleMap.cos();
	addToMap(spectralAngleMap_cos, {}, "Cosinus", false)
	
	var sum_cos = spectralAngleMap_cos.reduce(ee.call("Reducer.sum"));
	addToMap(sum_cos, {min: 2, max:3}, "Sum Cosinus")
	
	var sum_sin = spectralAngleMap_sin.reduce(ee.call("Reducer.sum"));
	addToMap(sum_sin, {min: 2, max:4}, "Sum  Sinus", false)
	
	var ndvi = img.normalizedDifference(["N", "R"]);
	var bundle = ee.Image.cat(ndvi, spectralAngleMap_sin, spectralAngleMap_cos);

	var imageClustered = ee.apply("Test.Clustering.RegionGrow", {
		"image": bundle,
		"threshold": 0.005,
		"useCosine": true,
		"maxObjectSize": maxObjSize,
	});
	addToMap(imageClustered.select("clusters"), {}, "Clustered RegionGrow", false)


	var imageConsistent = ee.apply("Test.Clustering.SpatialConsistency", {
	  "image": imageClustered,
	  "maxObjectSize": maxObjSize
	});
	addToMap(imageConsistent.select("clusters"), {min:100, max:55000}, "Consistent RegionGrow", false)
};

spectral_angle_mapper(image);