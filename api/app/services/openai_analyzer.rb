require "openai"

class OpenaiAnalyzer
  SYSTEM_PROMPT = <<~PROMPT.freeze
    You analyze news articles. Return ONLY valid JSON matching this schema:
    { "summary": string, "sentiment": "positive" | "neutral" | "negative" }

    - summary: 2-3 sentences, factual, no opinion of your own
    - sentiment: overall tone of the article content
  PROMPT

  VALID_SENTIMENTS = %w[positive neutral negative].freeze

  class Error < StandardError; end

  def initialize(client: OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY")))
    @client = client
  end

  def analyze(article)
    response = @client.chat(
      parameters: {
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: build_user_message(article) }
        ]
      }
    )

    content = response.dig("choices", 0, "message", "content")
    raise Error, "OpenAI returned no content" if content.nil? || content.empty?

    parsed = JSON.parse(content)

    summary = parsed["summary"].to_s.strip
    sentiment = parsed["sentiment"].to_s.strip.downcase

    raise Error, "OpenAI returned empty summary" if summary.empty?
    raise Error, "Invalid sentiment: #{parsed['sentiment'].inspect}" unless VALID_SENTIMENTS.include?(sentiment)

    { summary: summary, sentiment: sentiment }
  rescue JSON::ParserError => e
    raise Error, "OpenAI returned invalid JSON: #{e.message}"
  end

  private

  def build_user_message(article)
    title = article[:title] || article["title"]
    description = article[:description] || article["description"]
    "Title: #{title}\n\nContent: #{description}"
  end
end
