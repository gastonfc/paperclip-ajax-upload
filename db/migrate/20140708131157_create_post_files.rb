class CreatePostFiles < ActiveRecord::Migration
  def change
    create_table :post_files do |t|
      t.belongs_to :user
      t.attachment :attachment
    end
  end
end
