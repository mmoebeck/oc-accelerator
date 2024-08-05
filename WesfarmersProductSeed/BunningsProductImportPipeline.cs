using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Flurl.Http;
using Newtonsoft.Json;
using OrderCloud.Catalyst;
using OrderCloud.SDK;

namespace WesfarmersSeed
{
    public class BunningsProductImportPipeline
    {
        private readonly IOrderCloudClient _oc;
        private readonly AppSettings _settings;

        public BunningsProductImportPipeline(IOrderCloudClient oc, AppSettings settings)
        {
            _oc = oc;
            _settings = settings;
        }

        public async Task CreateCategories()
        {
            await _oc.Catalogs.SaveAsync(_settings.OrderCloud.BunningsCatalogID, new Catalog
            {
                ID = _settings.OrderCloud.BunningsCatalogID,
                Name = "Bunnings Catalog",
                Active = true
            });
            var products = Methods.ReadBunningsDetailFeed();
            var navCategoriesArray = products.Where(p => p.enrichedData?.navCategories?.Length > 0).Select(p => p.enrichedData.navCategories);
            var categoriesWithParent = new List<NavCategoryWithParent>();

            foreach (var navCategory in navCategoriesArray)
            {
                var sortedNavCategory = navCategory.OrderBy(c => c.level).ToList();
                int index = 0;
                foreach (var category in sortedNavCategory)
                {
                    if (categoriesWithParent.FirstOrDefault(c => c.code == category.code) == null)
                    {
                        string parentCode = null;
                        if (index > 0)
                        {
                            var parentCategory = sortedNavCategory[index - 1];
                            parentCode = parentCategory.code;
                        }

                        categoriesWithParent.Add(new NavCategoryWithParent
                        {
                            code = category.code,
                            name = category.name,
                            level = category.level,
                            parentCode = parentCode,
                        });
                    }
                    index++;
                }
            }

            var categoriesWithParentOrderedByLevel = categoriesWithParent.OrderBy(c => c.level);

            var total = products.Count();
            var progress = 1;
            var errors = new List<dynamic>();
            // Run each request with 100ms gap, and up to 100 requests concurrently
            await Throttler.RunAsync(categoriesWithParentOrderedByLevel, 100, 100, async category =>
            {
                try
                {
                    await _oc.Categories.SaveAsync(_settings.OrderCloud.BunningsCatalogID, category.code, new Category
                    {
                        ID = category.code,
                        Name = category.name,
                        Active = true,
                        ParentID = category.parentCode,
                    });
                    Console.WriteLine($"Imported {progress} categories out of {total}");
                    progress++;
                }
                catch (OrderCloudException ex)
                {
                    Console.WriteLine($"Error importing category {category.code}");
                    var flurlException = ex.InnerException as FlurlHttpException;

                    var errorLog = new
                    {
                        ex.Message,
                        ex.Errors,
                        RequestMessage = flurlException.Message,
                        flurlException.Call.RequestBody,
                        RequestHeaders = flurlException.Call.Request.Headers
                    };

                    errors.Add(errorLog);
                }
                catch (FlurlHttpException ex)
                {
                    Console.WriteLine($"Error importing category {category.code}");
                    var errorLog = new
                    {
                        Message = "",
                        Errors = "",
                        RequestMessage = ex.Message,
                        ex.Call.RequestBody,
                        RequestHeaders = ex.Call.Request.Headers
                    };

                    errors.Add(errorLog);
                }
            });

            Console.WriteLine($"Completed with {errors.Count()} errors");
            if (errors.Count() > 0)
            {
                Console.WriteLine("Check logs folder for detailed error log");
                Methods.WriteLogFile(Seller.Bunnings, errors, $"BunningsCategoryImport_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.json");
            }
        }

        public async Task ImportProducts()
        {
            var products = Methods.ReadBunningsDetailFeed();
            var prices = new List<Price>();
            string[] locationCodes = ["6011", "6035", "6042"];
            var inventoryByLocation = new Dictionary<string, List<Inventory>>();
            
            await _oc.Catalogs.SaveAsync(_settings.OrderCloud.BunningsCatalogID, new Catalog
            {
                ID = _settings.OrderCloud.BunningsCatalogID,
                Name = "Bunnings Catalog",
                Active = true
            });

            await _oc.Suppliers.SaveAsync("bunnings", new OrderCloud.SDK.Supplier
            {
                ID = "bunnings",
                Name = "Bunnings"
            });

            foreach (string locationCode in locationCodes)
            {
                await _oc.AdminAddresses.SaveAsync($"bunnings_{locationCode}", new Address
                {
                    ID = $"bunnings_{locationCode}",
                    AddressName = $"Bunnings {locationCode}",
                    Street1 = "Test",
                    City = "Test",
                    State = "Test",
                    Zip = "Test",
                    Country = "US",
                });

                var locationPrices = Methods.ReadBunningsPriceFeed(locationCode);
                prices.AddRange(locationPrices.SelectMany(locationPrice => locationPrice.prices.ToList()));
                inventoryByLocation[locationCode] = Methods.ReadBunningsInventoryFeed(locationCode);
            }
            var navCategoriesArray = products.Where(p => p.enrichedData?.navCategories?.Length > 0).Select(p => p.enrichedData.navCategories);

            var total = products.Count();
            var progress = 1;
            var errors = new List<dynamic>();
            // Run each request with 100ms gap, and up to 100 requests concurrently
            await Throttler.RunAsync(products, 100, 100, async product =>
            {
                try
                {
                    string assignToCategoryCode = null;
                    var floatUnitPrice = prices.FirstOrDefault(p => p.itemNumber == product.itemNumber)?.unitPrice ?? 0;
                    var decimalUnitPrice = (decimal)floatUnitPrice;
                    var price = await _oc.PriceSchedules.SaveAsync(product.itemNumber, new PriceSchedule
                    {
                        ID = product.itemNumber,
                        Name = product.itemNumber,
                        PriceBreaks = new List<PriceBreak>
                        {
                            new PriceBreak
                            {
                                Quantity = 1,
                                Price = decimalUnitPrice
                            }
                        }
                    });

                    var productBody = new BunningsOcProduct
                    {
                        ID = product.itemNumber,
                        Name = product.description?.productDescription?.Length > 100 ? product.description.productDescription.Substring(0, 100) : product.description.productDescription,
                        Active = true,
                        DefaultPriceScheduleID = price.ID,
                        DefaultSupplierID = "bunnings",
                        AutoForward = true,
                        Inventory = new OrderCloud.SDK.Inventory
                        {
                            Enabled = true
                        },
                        xp = new BunningsOcProductXp
                        {
                            Brand = product.brand,
                        }
                    };

                    if (product.enrichedData != null)
                    {
                        var enrichedData = product.enrichedData;
                        productBody.Name = enrichedData.name?.Length > 100 ? enrichedData.name.Substring(0, 100) : enrichedData.name;
                        productBody.Description = enrichedData.description?.Length > 2000 ? enrichedData.description.Substring(0, 2000) : enrichedData.description;

                        if (product.enrichedData.productDimensions?.Length > 0)
                        {
                            var dimensions = product.enrichedData.productDimensions[0];
                            decimal.TryParse(enrichedData.weight, out var shipWeight);
                            productBody.ShipHeight = dimensions.productDimensionHeight;
                            productBody.ShipWidth = dimensions.productDimensionWidth;
                            productBody.ShipHeight = dimensions.productDimensionHeight;
                            productBody.ShipWeight = shipWeight;
                        }

                        productBody.xp = new BunningsOcProductXp
                        {
                            BaseProductCode = enrichedData.baseProduct?.code,
                            Brand = product.brand,
                            Colour = enrichedData.colour,
                            Images = [
                                new XpImage
                            {
                                Url = enrichedData.picture?.primaryAssetURL
                            }
                            ],
                            KeySellingPoints = enrichedData.keySellingPoints,
                            Material = enrichedData.material,
                            ModelName = enrichedData.modelName,
                            ModelNumber = enrichedData.modelNumber,
                            NavCategories = enrichedData.navCategories
                        };

                        if (enrichedData.navCategories?.Length > 0)
                        {
                            var sortedNavCategories = enrichedData.navCategories.OrderBy(c => c.level);
                            assignToCategoryCode = sortedNavCategories.Last().code;
                        }
                    }

                    await _oc.Products.SaveAsync(product.itemNumber, productBody);
                    await _oc.Catalogs.SaveProductAssignmentAsync(new ProductCatalogAssignment
                    {
                        CatalogID = _settings.OrderCloud.BunningsCatalogID,
                        ProductID = product.itemNumber,
                    });

                    if (!string.IsNullOrEmpty(assignToCategoryCode))
                    {
                        await _oc.Categories.SaveProductAssignmentAsync(_settings.OrderCloud.BunningsCatalogID, new CategoryProductAssignment
                        {
                            CategoryID = assignToCategoryCode,
                            ProductID = product.itemNumber
                        });
                    }

                    foreach (string locationCode in locationCodes)
                    {
                        var inventories = inventoryByLocation[locationCode];
                        var productInventory = inventories.FirstOrDefault(i => i.itemNumber == product.itemNumber)?.stockCount ?? 0;
                        var inventoryRecordId = $"{product.itemNumber}_{locationCode}";
                        await _oc.InventoryRecords.SaveAsync(product.itemNumber, inventoryRecordId, new InventoryRecord
                        {
                            ID = inventoryRecordId,
                            AddressID = $"bunnings_{locationCode}",
                            QuantityAvailable = productInventory
                        });
                    }

                    Console.WriteLine($"Imported {progress} products out of {total}");
                    progress++;
                }
                catch (OrderCloudException ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"Error importing product {product.itemNumber}");
                    Console.ForegroundColor = ConsoleColor.White;
                    var flurlException = ex.InnerException as FlurlHttpException;

                    var errorLog = new
                    {
                        ex.Message,
                        ex.Errors,
                        RequestMessage = flurlException.Message,
                        flurlException.Call.RequestBody,
                        RequestHeaders = flurlException.Call.Request.Headers
                    };

                    errors.Add(errorLog);
                }
                catch (FlurlHttpException ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"Error importing product {product.itemNumber}");
                    Console.ForegroundColor = ConsoleColor.White;
                    var errorLog = new
                    {
                        Message = "",
                        Errors = "",
                        RequestMessage = ex.Message,
                        ex.Call.RequestBody,
                        RequestHeaders = ex.Call.Request.Headers
                    };

                    errors.Add(errorLog);
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"Error importing product {product.itemNumber}");
                    Console.WriteLine(ex.Message);
                    Console.ForegroundColor = ConsoleColor.White;
                    var errorLog = new
                    {
                        Message = "",
                        Errors = "",
                        RequestMessage = ex.Message
                    };

                    errors.Add(errorLog);
                }
            });

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"Completed with {errors.Count()} errors");
            if (errors.Count() > 0)
            {
                Console.WriteLine("Check logs folder for detailed error log");
                Methods.WriteLogFile(Seller.Bunnings, errors, $"BunningsProductImport_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.json");
            }
        }
    }
}
