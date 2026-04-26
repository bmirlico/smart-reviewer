module Api
  class AnalysesController < ApplicationController
    def create
      attrs = analysis_params

      existing = Result.find_by(url: attrs[:url])
      return render json: existing.as_json, status: :ok if existing

      analysis = OpenaiAnalyzer.new.analyze(
        title: attrs[:title],
        description: attrs[:description]
      )

      result = Result.create!(
        url: attrs[:url],
        title: attrs[:title],
        description: attrs[:description],
        source: attrs[:source],
        published_at: attrs[:published_at],
        summary: analysis[:summary],
        sentiment: analysis[:sentiment]
      )

      render json: result.as_json, status: :created
    rescue OpenaiAnalyzer::Error => e
      Rails.logger.error("[OpenaiAnalyzer::Error] #{e.message}")
      render json: { error: "Failed to analyze article" }, status: :bad_gateway
    end

    private

    def analysis_params
      params.permit(:url, :title, :description, :source, :published_at).tap do |p|
        raise ActionController::ParameterMissing, :url if p[:url].blank?
        raise ActionController::ParameterMissing, :title if p[:title].blank?
      end
    end
  end
end
