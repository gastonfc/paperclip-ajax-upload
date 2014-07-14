class PostFile < ActiveRecord::Base
  belongs_to :user
  has_attached_file :attachment,
                    :styles => { :medium => "300x300>", :thumb => "100x100>" },
                    :default_url => "/images/:style/missing.png"

  validates_attachment :attachment, 
      :content_type => { :content_type => /\Aimage\/.*\Z/ },
      :size => { :in => 0..10.kilobytes },
      :presence => true
end
