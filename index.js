$(document).ready(function(){
	// alert("index.js prepared!!");
   
    var minner = _FTracker || []; //Initialize FluentdTracker

	$("#send").on('click',function(){
		// alert("click");
		var message = $("#message").val();
		var host = $("#host").val();
		console.log("Sending log , message = : "+message+", host :" + host);
	    minner.push({
	        'message' : message,
	        'host' : host
	    });
	});


});