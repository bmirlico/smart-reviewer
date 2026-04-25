class ApplicationController < ActionController::API
  rescue_from StandardError do |e|
    Rails.logger.error("[#{e.class}] #{e.message}\n#{Array(e.backtrace).first(5).join("\n")}")
    render json: { error: "Internal server error" }, status: :internal_server_error
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: e.message }, status: :bad_request
  end

  rescue_from Mongoid::Errors::Validations do |e|
    render json: { error: e.message }, status: :unprocessable_entity
  end
end
