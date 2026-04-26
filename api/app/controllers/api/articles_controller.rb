module Api
  class ArticlesController < ApplicationController
    def index
      query = params[:q].to_s.strip
      return render json: { error: "q parameter is required" }, status: :bad_request if query.empty?

      articles = GnewsClient.new.search(query)
      render json: { articles: articles }
    rescue GnewsClient::Error => e
      Rails.logger.error("[GnewsClient::Error] #{e.message}")
      render json: { error: "Failed to fetch articles from news provider" }, status: :bad_gateway
    end
  end
end
