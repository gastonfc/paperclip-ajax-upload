$(function () {

  function humanReadableFileSize(size) {
      var m = Math, i = m.floor( m.log(size) / m.log(1024) );
      return ( size / m.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['bytes', 'kB', 'MB', 'GB', 'TB'][i];
  }

  function showFile(file, template, cont) {
    var upload = template.clone();

    $(".name", upload).text(file.name);
    $(".type", upload).text(file.type);
    $(".size", upload).text(humanReadableFileSize(file.size));

    $(".progressbar", upload).append($("<div>"));

    return upload.appendTo(cont);
  }

  function sendFile(url, file, cont) {
    var pbar = $(".progressbar div", cont),
        data = new FormData();

    data.append("datafile", file);

    var xhr = new XMLHttpRequest();
    if (xhr.upload) {

        xhr.upload.addEventListener("progress", function (progress) {
          var percentage = Math.floor((progress.loaded / progress.total) * 100);
          pbar.width(percentage + "%");
        });
        xhr.onreadystatechange = function (e) {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              pbar.addClass("success");
            } else {
              pbar.addClass("failed");
            }
            pbar.width("100%");
          }
        }
        xhr.open("POST", url, true);
        // Add csrf token for Rails
        var token = $('meta[name="csrf-token"]').attr('content');
        xhr.setRequestHeader("X-CSRF-Token", token);
        xhr.send(data);
    }
  }

  function fileDragHover(e) {
    e.preventDefault();
    e.stopPropagation();
    $("body")[(e.type === "dragover" ? "addClass" : "removeClass")]("file-hover");
  }

  function init_component(component) {
    var fileselect = $(".file-field", component),
        submitbutton = $('input[type="submit"]', component),
        url = component.attr("data-action"),
        uploadtemplate = $(".upload-files-list>*", component).detach(),
        uploadlist_cont = $(".upload-files-list", component);

    function fileSelectHandler(e) {
      var filecont;
      // cancel event and hover styling
      fileDragHover(e);

      // fetch FileList object
      var files = e.target.files || e.originalEvent.dataTransfer.files;

      // process all File objects
      for (var i = 0, f; f = files[i]; i++) {
        filecont = showFile(f, uploadtemplate, uploadlist_cont);
        sendFile(url, f, filecont);
      }
    }
    fileselect.on("change", fileSelectHandler);

    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
      console.log("comp", component);

      // file drop
      component.on("drop", fileSelectHandler);

      // remove submit button
      submitbutton.hide();
    }

  }

  if (window.File && window.FileList && window.FileReader) {
    $(".upload-files-ctrl").each(function (i, e) {
      init_component($(e));
    });

    $("body").on("dragover dragleave", fileDragHover);
  }

});
