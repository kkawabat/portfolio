function get_post(post_slug){
	var url = "post_request";

	$.ajax({
		url: url,
		data: {"post_slug": post_slug},
		dataType: "JSON",
		success: function(response){
			$("#contentDiv").html(response);
		}
	});
}