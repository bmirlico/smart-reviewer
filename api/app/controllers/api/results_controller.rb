module Api
  class ResultsController < ApplicationController
    def index
      results = Result.order(created_at: :desc).map(&:as_json)
      render json: { results: results }
    end
  end
end
