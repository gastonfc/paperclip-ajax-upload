module AjaxUploadHelper

  def ajax_upload_attributes(options)
    if options.include? :class
      classes = options[:class].split(" ")
    else
      classes = []
    end

    unless classes.include? "ajax-upload-ctrl"
      classes << "ajax-upload-ctrl"
      options[:class] = classes.join(" ")
    end

    attribute_list(options)
  end

  def ajax_upload_control(options=nil)
    render partial: '/shares/ajax_upload', object: options
  end

  private

  def attribute_name(key)
    if [:id, :class].include? key.to_sym
      key
    else
      "data-#{key.to_s.dasherize}"
    end
  end

  def attribute_list(attrs)
    raw attrs.to_a.map { |key, value|
      %(#{attribute_name key}="#{ERB::Util.h value}")
    }.join(" ")
  end
end
