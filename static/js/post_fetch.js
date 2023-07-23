function get_post(post_slug){
	$.ajax({
		url: "post_request",
		data: {"post_slug": post_slug},
		dataType: "JSON",
		success: function(response){
			$("#contentDiv").html(response);
			$("#contentDiv")[0].scrollIntoView();
		}
	});
}