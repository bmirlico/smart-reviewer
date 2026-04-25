Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    get "articles", to: "articles#index"
    resources :analyses, only: [:create]
    resources :results, only: [:index]
  end
end
