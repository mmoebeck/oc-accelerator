using Flurl.Http;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WesfarmersSeed
{
    public class BunningsProductExportPipeline
    {
        private readonly BunningsSDK _sdk;

        public BunningsProductExportPipeline(BunningsSDK sdk)
        {
            _sdk = sdk;
        }

        public async Task Run()
        {
            string[] locationCodes = ["6011", "6035", "6042"];
            var allItems = new List<Result>();
            foreach (string locationCode in locationCodes)
            {
                var searchResults = await SearchProducts(locationCode);
                Methods.WriteBunningsProductFeed(searchResults, locationCode);
                allItems.Concat(searchResults.Item1);
                var locationItemNumbers = searchResults.Item1.Select(i => i.itemNumber).ToList();
                //var prices = await GetPrices(locationItemNumbers, locationCode);
                //Methods.WriteBunningsPriceFeed(prices, locationCode);
                var inventory = await GetInventory(locationItemNumbers, locationCode);
                Methods.WriteBunningsInventoryFeed(inventory, locationCode);
            }

            // get details for all unique products
            var allItemNumbers = allItems
                                        .Select(i => i.itemNumber)
                                        .Where(itemNumber => itemNumber != null)
                                        .Distinct()
                                        .ToList();
            var details = await GetProductDetails(allItemNumbers);

            Methods.WriteBunningsDetailFeed(details);
        }

        private async Task<Tuple<List<Result>, List<Facet>>> SearchProducts(string locationCode)
        {
            var results = new List<Result>();
            var facets = new List<Facet>();
            var continuationToken = "";
            while (continuationToken != null)
            {
                try
                {
                    var query = await _sdk.Search("AU", locationCode, continuationToken);
                    await Task.Delay(TimeSpan.FromSeconds(2));
                    results.AddRange(query.results);
                    facets.AddRange(query.facets);
                    continuationToken = query._meta.ContinuationToken;
                    Console.WriteLine("Search: " + continuationToken);
                }
                catch (FlurlHttpException ex)
                {
                    // Seems to be a quirk of the bunnings API in that a continuation token will return not found
                    // I think this means all of the items have been listed and is equivalent to an empty continuation token
                    // so we will consider as success
                    if (ex.StatusCode == 404)
                    {
                        return new Tuple<List<Result>, List<Facet>>(results, facets);
                    }
                    else
                    {
                        throw;
                    }
                }
            }
            return new Tuple<List<Result>, List<Facet>>(results, facets);
        }

        private async Task<List<Item>> GetProductDetails(List<string> items)
        {
            var results = new List<Item>();
            for (int i = 0; i < items.Count; i += 20)
            {
                var ids = string.Join(",", items.Skip(i).Take(20));
                var products = await _sdk.Get(ids);
                await Task.Delay(TimeSpan.FromSeconds(3));
                if(products != null)
                {
                    results.AddRange(products.items);
                    Console.WriteLine("Details: " + ids);
                }
            }
            Methods.WriteBunningsDetailFeed(results);
            return results;
        }

        private async Task<List<Prices>> GetPrices(List<string> items, string location) 
        {
            var results = new List<Prices>();
            for (int i = 0; i < items.Count; i += 20)
            {
                var priceContext = new Pricing()
                {
                    context = new Context()
                    {
                        country = "AU",
                        location = location
                    },
                    items = []
                };
                foreach (var s in items.Skip(i).Take(20))
                {
                    if (s != null)
                        priceContext.items.Add(new PriceItem() { itemNumber = s.ToString() });
                }

                var prices = await _sdk.Get(priceContext);
                await Task.Delay(TimeSpan.FromSeconds(2));
                results.Add(prices);
                Console.WriteLine("Prices: " + string.Join(",", items.Skip(i).Take(20)));
            }
            return results;
        }

        private async Task<List<Inventory>> GetInventory(List<string> items, string location)
        {
            var results = new List<Inventory>();
            for (int i = 0; i < items.Count; i += 20)
            {
                var ids = new List<string>();
                foreach (var s in items.Skip(i).Take(20))
                {
                    if (s != null)
                        ids.Add(s);
                }

                var inventory = await _sdk.Get(string.Join(",",ids), location);
                await Task.Delay(TimeSpan.FromSeconds(2));
                results.AddRange(inventory);
                Console.WriteLine("Inventory: " + string.Join(",", items.Skip(i).Take(20)));
            }
            return results;
        }
    }
}
