require "oauth2"
require "dotenv/load"

env_path = File.expand_path("../.env", __dir__)
Dotenv.load(env_path)

UID = ENV['42UID']
SECRET = ENV['42SECRET']
# Create the client with your credentials
client = OAuth2::Client.new(UID, SECRET, site: "https://api.intra.42.fr")
# Get an access token
token = client.client_credentials.get_token

puts(token.get("/v2/me").parsed)
