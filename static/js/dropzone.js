function init_dropzones(dropzoneDiv, update_thumbnails = true, callback_on_drop=()=>{}){
    // see ref here https://codepen.io/dcode-software/pen/xxwpLQo
    const inputElement = dropzoneDiv.getElementsByTagName('INPUT')[0]
    const dropZoneElement = inputElement.closest(".drop-zone");

    dropZoneElement.addEventListener("click", (e) => { inputElement.click(); });

    inputElement.addEventListener("change", (e) => { if (inputElement.files.length & update_thumbnails) { updateThumbnail(dropZoneElement, inputElement.files[0]); } });

    dropZoneElement.addEventListener("dragover", (e) => { e.preventDefault(); dropZoneElement.classList.add("drop-zone--over"); });
    dropZoneElement.addEventListener("dragleave", (e) => { dropZoneElement.classList.remove("drop-zone--over"); });
    dropZoneElement.addEventListener("dragend", (e) => { dropZoneElement.classList.remove("drop-zone--over"); });

    dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();

        if (e.dataTransfer.files.length ) {
            inputElement.files = e.dataTransfer.files;
            if (update_thumbnails){
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }
        }
        callback_on_drop(e);
        dropZoneElement.classList.remove("drop-zone--over");
    });
}

function updateThumbnail(dropZoneElement, file) {
    let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

    // First time - remove the prompt
    if (dropZoneElement.querySelector(".drop-zone__prompt")) { dropZoneElement.querySelector(".drop-zone__prompt").remove(); }

    // First time - there is no thumbnail element, so lets create it
    if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
    }

    thumbnailElement.dataset.label = file.name;

    // Show thumbnail for image files
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => { thumbnailElement.style.backgroundImage = `url('${reader.result}')`; };
    }
    else { thumbnailElement.style.backgroundImage = null; }
}
