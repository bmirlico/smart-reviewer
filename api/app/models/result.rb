class Result
  include Mongoid::Document
  include Mongoid::Timestamps

  SENTIMENTS = %w[positive neutral negative].freeze

  field :url, type: String
  field :title, type: String
  field :source, type: String
  field :published_at, type: Time
  field :description, type: String
  field :summary, type: String
  field :sentiment, type: String

  index({ url: 1 }, { unique: true })
  index({ created_at: -1 })

  validates :url, :title, :summary, :sentiment, presence: true
  validates :url, uniqueness: true
  validates :sentiment, inclusion: { in: SENTIMENTS }

  def as_json(_opts = {})
    {
      id: id.to_s,
      url: url,
      title: title,
      source: source,
      published_at: published_at,
      summary: summary,
      sentiment: sentiment,
      created_at: created_at
    }
  end
end
