class PostsController < ApplicationController
  before_filter :parse_raw_upload, :only => :add_files

  def add_files
    @post_file = @post.post_files.build(attachment: @raw_file)
    if @post_file.save
      render js: { success: true }
    else
      render js: { success: false }
    end
  end

private
  def parse_raw_upload
    if env['HTTP_X_FILE_UPLOAD'] == 'true'
      @raw_file = env['rack.input']
      @raw_file.class.class_eval { attr_accessor :original_filename, :content_type }
      @raw_file.original_filename = env['HTTP_X_FILE_NAME']
      @raw_file.content_type = env['HTTP_X_MIME_TYPE']
    end
  end
end
