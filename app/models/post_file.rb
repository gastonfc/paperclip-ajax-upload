class PostFile < ActiveRecord::Base
  belongs_to :post
  has_attached_file :attachment, paperclip_configurations
end
