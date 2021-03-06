class TagsController < ApplicationController

  def index
    @page_title = 'Find By Category'
    @tags = Treatment.tag_counts(:order => 'name')
  end
  
  def show
    @page_title = Tag.find(params[:id])
    @treatments = Treatment.find_tagged_with("#{@page_title}", :order => 'name')
  end

end
