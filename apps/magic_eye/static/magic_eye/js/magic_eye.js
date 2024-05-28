$('#genForm').on( "submit", function( event ) {
    event.preventDefault();
    var $form = $( this );
    url = $form.attr( "action" );
    texture_image = $form.find( "input[name='textureFile']" )[0].files[0]
    depth_image = $form.find( "input[name='depthMapFile']" )[0].files[0]

    var formData = new FormData();
    formData.append('csrfmiddlewaretoken', '{{ csrf_token }}');
    formData.append('texture', texture_image);
    formData.append('depth_map', depth_image);

    $.ajax({
        url: url,
        type: 'POST',
        dataType: "json",
        data: formData,
        enctype: 'multipart/form-data',
        cache: false,
        processData: false,
        contentType: false,
        success: function(response){
            if('error' in response){
                alert(response['error'])
            }
            else{
                $('#generated_image').empty().append('<img style="max-width: 100%;" src="'+response['image_url']+'" />')
            }
        },
        error: function (request, status, error) {
            console.log('failed')
        }
    });
});

$('#decodeForm').on( "submit", function( event ) {
    event.preventDefault();

    $("#decodeSubmitBtn").prop("value", "Decoding in progress (this might take a moment)...");

    var $form = $( this );
    url = $form.attr( "action" );
    input_image = $form.find( "input[name='decodableFile']" )[0].files[0]

    var formData = new FormData();
    formData.append('csrfmiddlewaretoken', '{{ csrf_token }}');
    formData.append('input_image', input_image);

    $.ajax({
        url: url,
        type: 'POST',
        dataType: "json",
        data: formData,
        enctype: 'multipart/form-data',
        cache: false,
        processData: false,
        contentType: false,
        success: function(response){
            $("#decodeSubmitBtn").prop("value", "Decode Magic Eye");
            if('error' in response){
                alert(response['error'])
            }
            else{
                $('#decoded_image').empty().append('<img style="max-width: 100%;" src="'+response['image_url']+'" />');
            }

        },
        error: function (request, status, error) {
            console.log('failed')
        }
    });
});