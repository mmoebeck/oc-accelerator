using Flurl.Http;
using OrderCloud.SDK;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;

namespace WesfarmersSeed
{
    public class BunningsSDK
    {
        private AppSettings _settings;
        private Token _token;
        public BunningsSDK(AppSettings settings)
        {
            _settings = settings;
        }

        public async Task GetToken()
        {
            _token = await _settings.Bunnings.AuthUrl
                .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                .PostUrlEncodedAsync(new
                {
                    grant_type = _settings.Bunnings.GrantType,
                    client_id = _settings.Bunnings.ClientID,
                    client_secret = _settings.Bunnings.ClientSecret
                }).ReceiveJson<Token>();
        }

        private async Task<string> GetValidToken()
        {
            if (IsTokenExpired(_token?.access_token))
            {
                await GetToken();
                return _token.access_token;
            }
            else
            {
                return _token.access_token;
            }
        }

        private bool IsTokenExpired(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return true;
            }
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var expirationClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == JwtRegisteredClaimNames.Exp);
            if (expirationClaim == null)
            {
                throw new InvalidOperationException("Token does not contain 'exp' claim.");
            }

            var expirationDateUnix = long.Parse(expirationClaim.Value);
            var expirationDateTimeUtc = DateTimeOffset.FromUnixTimeSeconds(expirationDateUnix).UtcDateTime;
            var expirationDateTimeWithBuffer = expirationDateTimeUtc.AddSeconds(-35);

            return expirationDateTimeWithBuffer < DateTime.UtcNow;
        }


        public async Task<Items> Search(string countryCode, string locationCode, string continuationToken)
        {

            const int maxRetries = 3;
            const int delayMilliseconds = 30 * 1000;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var token = await GetValidToken();
                    var items = await $"https://item.stg.api.bunnings.com.au/item/search/{countryCode}"
                        .WithHeader("x-version-api", "1.4")
                        .WithHeader("continuationtoken", continuationToken)
                        .WithOAuthBearerToken(token)
                        .PostJsonAsync(new
                        {
                            query = "%",
                            filters = new
                            {
                                locationCode
                            },
                            sortBy = "relevancy"
                        }).ReceiveJson<Items>();

                    return items;
                }
                catch (FlurlHttpException ex)
                {
                    Console.WriteLine($"Error in search attempt {attempt}: {ex.Message} : {continuationToken}");
                    var retryableError = ex.StatusCode >= 500;
                    if (attempt < maxRetries && retryableError)
                    {
                        await Task.Delay(delayMilliseconds);
                    }
                    else
                    {
                        throw;
                    }
                }
            }

            return null;
        }

        public async Task<Prices> Get(Pricing context)
        {
            try
            {
                var token = await GetValidToken();
                var prices = await $"https://pricing.stg.api.bunnings.com.au/pricing/catalog/prices"
                    .WithHeader("x-version-api", "1.0")
                    .WithOAuthBearerToken(token)
                    .PostJsonAsync(context)
                    .ReceiveJson<Prices>();
                return prices;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in getting prices:" + ex.Message);
                return null;
            }
        }

        public async Task<Details> Get(string ids)
        {
            try
            {
                var token = await GetValidToken();
                var details = await $"https://item.stg.api.bunnings.com.au/item/details/AU?itemNumbers={ids}"
                    .WithHeader("x-version-api", "1.4")
                    .WithOAuthBearerToken(token)
                    .GetJsonAsync<Details>();
                return details;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in getting details: " + ex.Message + " : " + ids);
                return null;
            }
        }

        public async Task<List<Inventory>> Get(string ids, string locations)
        {
            try
            {
                var token = await GetValidToken();
                var details = await $"https://inventory.stg.api.bunnings.com.au/inventory/itemStock/AU?locationCodes={locations}&itemNumbers={ids}"
                    .WithHeader("x-version-api", "1.0")
                    .WithOAuthBearerToken(token)
                    .GetJsonAsync<List<Inventory>>();
                return details;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in getting inventory: " + ex.Message + " : " + ids);
                return null;
            }
        }
    }
}
