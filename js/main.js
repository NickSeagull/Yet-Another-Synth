function main(){
    console.log("Im ready!");
    $('#volumeSlider').bootstrapSlider({
	       formatter: function(value) {
		             return value;
	                }
    });
    $('#cutoffSlider').bootstrapSlider({
	       formatter: function(value) {
		             return value;
	                }
    });
    $('#distortionSlider').bootstrapSlider({
	       formatter: function(value) {
		             return value + "%";
	                }
    });
}
