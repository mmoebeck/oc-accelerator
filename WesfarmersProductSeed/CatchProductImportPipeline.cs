using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Flurl.Http;
using Microsoft.AspNetCore.JsonPatch.Internal;
using OrderCloud.Catalyst;
using OrderCloud.SDK;

namespace WesfarmersSeed
{
    public class CatchProductImportPipeline
    {
        private readonly IOrderCloudClient _oc;
        private readonly AppSettings _settings;

        public CatchProductImportPipeline(IOrderCloudClient oc, AppSettings settings)
        {
            _oc = oc;
            _settings = settings;
        }
        public async Task CreateCategories()
        {
            var categories = Methods.ReadCatchCsv<CatchItemGroup>("item_groups.csv");
            var createdCategories = new List<CatchItemGroup>();
            var categoryDict = categories.ToDictionary(c => c.id);
            var parentChildMap = new Dictionary<string, List<CatchItemGroup>>();

            // Build the parent-child map
            foreach (var category in categories)
            {
                if (!string.IsNullOrEmpty(category.parent_id))
                {
                    if (!parentChildMap.ContainsKey(category.parent_id))
                    {
                        parentChildMap[category.parent_id] = new List<CatchItemGroup>();
                    }
                    parentChildMap[category.parent_id].Add(category);
                }
            }

            // Topological sort and creation
            var visited = new HashSet<string>();

            foreach (var category in categories)
            {
                if (!visited.Contains(category.id))
                {
                    await CreateCategory(category, parentChildMap, visited, createdCategories, categoryDict);
                }
            }
        }

        private async Task CreateCategory(CatchItemGroup category, Dictionary<string, List<CatchItemGroup>> parentChildMap, HashSet<string> visited, List<CatchItemGroup> createdCategories, Dictionary<string, CatchItemGroup> categoryDict)
        {
            if (visited.Contains(category.id)) return;

            // Mark the current category as visited
            visited.Add(category.id);

            // If the category has a parent, create the parent first
            if (!string.IsNullOrEmpty(category.parent_id) && categoryDict.ContainsKey(category.parent_id))
            {
                var parentCategory = categoryDict[category.parent_id];
                if (!visited.Contains(parentCategory.id))
                {
                    await CreateCategory(parentCategory, parentChildMap, visited, createdCategories, categoryDict);
                }
            }

            // Create the current category
            await _oc.Categories.SaveAsync(_settings.OrderCloud.CatchCatalogID, category.id, new Category
            {
                ID = category.id,
                Name = category.name,
                ParentID = category.parent_id,
                Active = true,
            });
            createdCategories.Add(category);
            Console.WriteLine($"Created category: {category.name} (ID: {category.id}, ParentID: {category.parent_id})");

            // Create children
            if (parentChildMap.ContainsKey(category.id))
            {
                foreach (var childCategory in parentChildMap[category.id])
                {
                    if (!visited.Contains(childCategory.id))
                    {
                        await CreateCategory(childCategory, parentChildMap, visited, createdCategories, categoryDict);
                    }
                }
            }
        }

        public async Task CreateProducts()
        {
            
            await _oc.ProductFacets.SaveAsync("Price", new ProductFacet
            {
                ID = "Price",
                Name = "Price",
                XpPath = "Facets.Price",
            });

            var rows = Methods.ReadCatchCsv<CatchItem>("items_full_7gb.csv", numRecords: 5000);
            var total = rows.Count();
            var progress = 1;
            var errors = new List<dynamic>();

            // Run each request with 100ms gap, and up to 100 requests concurrently
            await Throttler.RunAsync(rows.Take(5000), 100, 100, async row =>
            {
                try
                {
                    var priceSchedule = await _oc.PriceSchedules.SaveAsync(row.id, new PriceSchedule
                    {
                        ID = row.id,
                        Name = row.id,
                        PriceBreaks =
                    [
                        new PriceBreak
                        {
                            Quantity = 1,
                            Price = row.metadata_price,
                        }
                    ]
                    });
                    var product = await _oc.Products.SaveAsync(row.id, new CatchOcProduct
                    {
                        ID = row.id,
                        Name = row.item_name.Length > 100 ? row.item_name.Substring(0, 100) : row.item_name,
                        Description = row.description.Length > 2000 ? row.description.Substring(0, 2000) : row.description,
                        Active = true,
                        DefaultPriceScheduleID = priceSchedule.ID,
                        AutoForward = true,
                        xp = new CatchOcProductXp
                        {
                            Url = row.url,
                            Images = [new XpImage { Url = row.image_url }],
                            Facets = new CatchFacets
                            {
                                Price = row.facet_price
                            }
                        }
                    });

                    // generate variants if size spec exists
                    if (!string.IsNullOrEmpty(row.facet_variant_size_value))
                    {
                        var specId = row.id + "_size";
                        var spec = await _oc.Specs.SaveAsync(specId, new Spec
                        {
                            ID = specId,
                            Name = "Size",
                            Required = true,
                            DefinesVariant = true,
                            
                        });

                        var sizes = row.facet_variant_size_value.Split("|");

                        var specOptionRequests = sizes.Select(size => _oc.Specs.SaveOptionAsync(specId, Methods.Slugify(size), new SpecOption
                        {
                            ID = product.ID + "size_" + Methods.Slugify(size),
                            Value = size
                        }));
                        await Task.WhenAll(specOptionRequests);

                        await _oc.Specs.SaveProductAssignmentAsync(new SpecProductAssignment
                        {
                            SpecID = specId,
                            ProductID = product.ID
                        });

                        await _oc.Products.GenerateVariantsAsync(product.ID, overwriteExisting: true);
                        
                    }

                    await _oc.Catalogs.SaveProductAssignmentAsync(new ProductCatalogAssignment
                    {
                        CatalogID = _settings.OrderCloud.CatchCatalogID,
                        ProductID = product.ID
                    });

                    // assign to category
                    if (!string.IsNullOrEmpty(row.group_ids))
                    {
                        // the property name "group_ids" seems to imply there could be more than one category defined
                        // in our small data set there only ever appears to be 1 category
                        // and without any examples of ones where there is more than 1, we don't know what the delimiter is
                        // so for now assume there is only 1 category
                        var categoryId = row.group_ids;
                        await _oc.Categories.SaveProductAssignmentAsync(_settings.OrderCloud.CatchCatalogID, new CategoryProductAssignment
                        {
                            CategoryID = categoryId,
                            ProductID = product.ID
                        });
                    }

                    Console.WriteLine($"Imported {progress} products out of {total}");
                    progress++;
                }
                catch (OrderCloudException ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"Error importing product {row.id}");
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
                    Console.WriteLine($"Error importing product {row.id}");
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
                    Console.WriteLine($"Error importing product {row.id}");
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
                Methods.WriteLogFile(Seller.Catch, errors, $"CatchProductImport_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.json");
            }
        }

        public async Task ProductUpdateDefaultSupplierID()
        {
            // get all products from OC
            var products = await _oc.Products.ListAllAsync("catch");

            await Throttler.RunAsync(products, 500, 100, async product =>
            {
                await _oc.Products.PatchAsync(product.ID, new PartialProduct()
                {
                    DefaultSupplierID = "catch_supplier",
                    AutoForward = true,
                    Inventory = new OrderCloud.SDK.Inventory()
                    {
                        Enabled = true
                    }
                });
            });
        }

        public async Task CreateInventoryRecords()
        {
            var products = await _oc.Products.ListAllAsync("catch");

            await Throttler.RunAsync(products, 500, 100, async product =>
            {
                var record = await _oc.InventoryRecords.SaveAsync(product.ID, product.ID, new InventoryRecord()
                {
                    OwnerID = "catch_supplier",
                    AddressID = "catch_address",
                    OrderCanExceed = true,
                    QuantityAvailable = 100,
                    AllowAllBuyers = true
                });
                await _oc.InventoryRecords.SaveAssignmentAsync(product.ID, new InventoryRecordAssignment()
                {
                    InventoryRecordID = record.ID,
                    BuyerID = "onepass"
                });
            });
        }
    }
}
