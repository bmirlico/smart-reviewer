require "httparty"

class GnewsClient
  include HTTParty
  base_uri "https://gnews.io/api/v4"
  default_timeout 10

  class Error < StandardError; end

  def search(query)
    raise ArgumentError, "query is required" if query.to_s.strip.empty?

    response = self.class.get(
      "/search",
      query: {
        q: query,
        lang: "en",
        max: 10,
        apikey: ENV.fetch("GNEWS_API_KEY")
      }
    )

    unless response.success?
      raise Error, "GNews returned #{response.code}: #{response.body}"
    end

    Array(response.parsed_response["articles"]).map { |a| normalize(a) }
  end

  private

  def normalize(article)
    {
      url: article["url"],
      title: article["title"],
      description: article["description"],
      image: article["image"],
      source: article.dig("source", "name"),
      published_at: article["publishedAt"]
    }
  end
end
