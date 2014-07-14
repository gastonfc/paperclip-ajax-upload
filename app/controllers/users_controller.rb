class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update, :destroy, :add_files]

  # GET /users
  # GET /users.json
  def index
    @users = User.all
  end

  # GET /users/1
  # GET /users/1.json
  def show
  end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit
  end

  # POST /users
  # POST /users.json
  def create
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save
        format.html { redirect_to @user, notice: 'User was successfully created.' }
        format.json { render :show, status: :created, location: @user }
      else
        format.html { render :new }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /users/1
  # PATCH/PUT /users/1.json
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user.destroy
    respond_to do |format|
      format.html { redirect_to users_url, notice: 'User was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def add_files
    get_file do |file|
      post_file = @user.post_files.build(attachment: file)

      if post_file.save
        { success: true }
      else
        messages = get_attachment_errors(post_file.errors, :attachment)
        { success: false, error: messages.join(". ") }
      end
    end
  end

  # Returns Paperclip's extra attributes for attachment's errors.
  def get_attachment_errors(active_model_errors, attribute)
    messages = []
    active_model_errors.keys.each do |key|
      messages.push(active_model_errors.full_messages_for(key)) unless key == attribute
    end
    return messages
  end

  def get_file()
    upload = params[:upload] || params
    datafile = upload['file']

    result = yield(datafile)

    respond_to do |format|
      format.html { render text: "File has been uploaded successfully" }
      format.json { render json: result }
    end
  end

#    @post_file = @user.post_files.build(attachment: @raw_file)
#    if @post_file.save
#      render json: { success: true }
#    else
#      render json: { success: false }
#    end
#  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def user_params
      params.require(:user).permit(:name, :avatar)
    end

    def parse_raw_upload
      if env['HTTP_X_FILE_UPLOAD'] == 'true'
        @raw_file = env['rack.input']
        @raw_file.class.class_eval { attr_accessor :original_filename, :content_type }
        @raw_file.original_filename = env['HTTP_X_FILE_NAME']
        @raw_file.content_type = env['HTTP_X_MIME_TYPE']
      end
    end
end
