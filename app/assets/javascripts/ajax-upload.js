(function ($, window) {
  'use strict';

  function humanReadableFileSize(size) {
      var m = Math, i = m.floor( m.log(size) / m.log(1024) );
      return ( size / m.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['bytes', 'KB', 'MB', 'GB', 'TB'][i];
  }

  function showFile(file, template, cont) {
    var upload = template.clone();

    $(".name", upload).text(file.name);
    $(".type", upload).text(file.type);
    $(".size", upload).text(humanReadableFileSize(file.size));

    return upload.appendTo(cont);
  }

  function isResponseJSON(xhr) {
    return /json/.test(xhr.getResponseHeader('content-type'));
  }

  function setProgressBarValue(progressbar, value) {
    progressbar.width(value + "%");
    progressbar.attr("aria-valuenow", value);
  }

  function setProgressBarResult(progressbar, success, error) {
    progressbar.addClass("progress-bar-" + (success ? "success" : "danger")).width("100%").text(error || "");
    setProgressBarValue(progressbar, 100);
  }

  function getProgressBar(filecont) {
    return $(".progress-bar", filecont);
  }

  function fileContainerRemove(filecont) {
    filecont.slideUp("slow", function () { filecont.remove() });
  }

  function setFileContainterStatus(filecont, success, error) {
    var remove = function() { fileContainerRemove(filecont); };
    setProgressBarResult(getProgressBar(filecont), success, error);
    if (success) {
      setTimeout(remove, 2000);
    } else {
      $(".remove", filecont).fadeIn().css("cursor", "pointer"); filecont.click(remove);
    }
  }

  function stateChangeCallback(component, filecont) {
    var upload_callback = component.attr("data-on-upload-callback"),
        upload_callback_func = window[upload_callback] || function () { };

    return function () {
      var xhr = this;
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          if (isResponseJSON(xhr)) {
            var result = JSON.parse(xhr.responseText);
            setFileContainterStatus(filecont, result.success, result.error);
            upload_callback_func.apply(component, [result]);
          } else {
            setFileContainterStatus(filecont, false, "Server error: unexpected response");
            upload_callback_func.apply(component);
          }
        } else {
          setFileContainterStatus(filecont, false, "Server error: " + xhr.status);
          upload_callback_func.apply(component);
        }
      }
    }
  }

  function sendFileByAjax(file, component, filecont) {
    var url = component.attr("data-action"),
        data = new FormData(),
        pbar = getProgressBar(filecont);

    data.append("file", file);

    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
        xhr.upload.addEventListener("progress", function (progress) {
          var percentage = Math.floor((progress.loaded / progress.total) * 100);
          setProgressBarValue(pbar, percentage);
        });
        xhr.onreadystatechange = stateChangeCallback(component, filecont);
        xhr.open("POST", url + '.json', true);

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

  function fileDragHoverComponent(component) {
    return function (e) {
      $(component)[(e.type === "dragover" ? "addClass" : "removeClass")]("component-file-hover");
    }
  }

  function isFileValid(component, file) {
    var maxsize = component.attr("data-max-size"),
        minsize = component.attr("data-min-size"),
        content_type_pattern = component.attr("data-valid-content-type-pattern");

    if (content_type_pattern) {
      var re = new RegExp(content_type_pattern);
      if (!re.test(file.type)) {
        return { success: false, error: 'This file type is not allowed' };
      }
    }
    if (maxsize) {
      maxsize = parseInt(maxsize, 10);
      if (maxsize && (file.size > maxsize)) {
        return { success: false, error: "File size can't be greater than " + humanReadableFileSize(maxsize) };
      }
    }
    if (minsize) {
      minsize = parseInt(minsize, 10);
      if (minsize && (file.size > minsize)) {
        return { success: false, error: "File size must be at least " + humanReadableFileSize(minsize) };
      }
    }
    return { success: true }
  }

  function getFileSelectHandler(component) {
    var uploadtemplate = $(".ajax-upload-list>*", component).detach(),
        uploadlist_cont = $(".ajax-upload-list", component);

    return function (e) {
      var filecont,
          // fetch FileList object
          files = e.target.files || e.originalEvent.dataTransfer.files,
          validation;

      // cancel event and hover styling
      fileDragHover(e);

      // process all File objects
      for (var i = 0, f; f = files[i]; i++) {
        filecont = showFile(f, uploadtemplate, uploadlist_cont);

        validation = isFileValid(component, f);
        if (validation.success) {
          sendFileByAjax(f, component, filecont);
        } else {
          setProgressBarResult(pbar, validation.success, validation.error);
        }
      }
    }
  }

  function init_component(component) {
    var fileselect = $(".file-field", component),
        submitbutton = $('input[type="submit"]', component),
        fileSelectHandler = getFileSelectHandler(component);

    fileselect.on("change", fileSelectHandler);

    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {
      // file drop
      component.on("drop", fileSelectHandler);
      component.on("dragover dragleave", fileDragHoverComponent(component));

      // remove submit button
      submitbutton.hide();
    }
  }

  function initpage() {
    $(".ajax-upload-ctrl").each(function (i, e) {
      init_component($(e));
    });

    $("body").on("dragover dragleave", fileDragHover);
  }

  if (window.File && window.FileList && window.FileReader) {
    $(initpage);
    $(document).on('page:load', initpage);
  }
}) (jQuery, window);
