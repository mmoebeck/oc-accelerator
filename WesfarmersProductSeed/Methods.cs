using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CsvHelper;
using CsvHelper.Configuration;
using Newtonsoft.Json;

namespace WesfarmersSeed
{
    public static class Methods
    {
        public static void WriteBunningsProductFeed(Tuple<List<Result>, List<Facet>> items, string locationCode)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, $"{locationCode}_search.json");
            using StreamWriter file = File.CreateText(filePath);
            JsonSerializer serializer = new JsonSerializer();
            serializer.Serialize(file, items.Item1);

            using StreamWriter file2 = File.CreateText(GetDataFilePath(Seller.Bunnings, $"{locationCode}_facets.json"));
            JsonSerializer serializer2 = new JsonSerializer();
            serializer.Serialize(file2, items.Item2);
        }

        public static Tuple<List<Result>, List<Facet>> ReadBunningsProductFeed(string locationCode)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, $"{locationCode}_search.json");
            var searchText = File.ReadAllText(filePath);
            var search = JsonConvert.DeserializeObject<List<Result>>(searchText);
            var facetsText = File.ReadAllText(GetDataFilePath(Seller.Bunnings, $"{locationCode}_facets.json"));
            var facets = JsonConvert.DeserializeObject<List<Facet>>(facetsText);
            return new Tuple<List<Result>, List<Facet>>(search, facets);
        }

        public static void WriteBunningsDetailFeed(List<Item> items)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, "products.json");
            using StreamWriter file = File.CreateText(filePath);
            JsonSerializer serializer = new JsonSerializer();
            serializer.Serialize(file, items);
        }

        public static void WriteBunningsPriceFeed(List<Prices> items, string locationCode)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, $"{locationCode}_prices.json");
            using StreamWriter file = File.CreateText(filePath);
            JsonSerializer serializer = new JsonSerializer();
            serializer.Serialize(file, items);
        }

        public static void WriteBunningsInventoryFeed(List<Inventory> items, string locationCode)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, $"{locationCode}_inventory.json");
            using StreamWriter file = File.CreateText(filePath);
            JsonSerializer serializer = new JsonSerializer();
            serializer.Serialize(file, items);
        }

        public static List<Prices> ReadBunningsPriceFeed(string locationCode)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, $"{locationCode}_prices.json");
            var text = File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<List<Prices>>(text);
        }

        public static List<Inventory> ReadBunningsInventoryFeed(string locationCode)
        {
            var filePath = GetDataFilePath(Seller.Bunnings, $"{locationCode}_inventory.json");
            var text = File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<List<Inventory>>(text);
        }

        public static void WriteLogFile(Seller seller, List<dynamic> items, string filename)
        {
            var filePath = GetDataFilePath(seller, filename);
            using StreamWriter file = File.CreateText(filePath);
            JsonSerializer serializer = new JsonSerializer();
            serializer.Serialize(file, items);
        }

        public static List<Item> ReadBunningsDetailFeed()
        {
            var filePath = GetDataFilePath(Seller.Bunnings, "products.json");
            var text = File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<List<Item>>(text);
        }

        public static List<T> ReadCatchCsv<T>(string filename, int? numRecords = null)
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                // map headers to c# class
                PrepareHeaderForMatch = args => args.Header
                    .Replace(":", "_").Replace("/", "_").Replace(".", "_").Replace("-", "_") // replace most special characters with underscore
                    .Replace(")", "").Replace("(", ""), // remove parenthese
            };
            var filePath = GetDataFilePath(Seller.Catch, filename);
            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, config))
            {
                var records = csv.GetRecords<T>();
                if(numRecords != null)
                {
                    return records.Take(5000).ToList();
                } else
                {
                    return records.ToList();
                }
            }
        }


        private static string GetDataFilePath(Seller seller, string fileName)
        {
            var workingDirectory = Environment.CurrentDirectory;
            var projectDirectory = Directory.GetParent(workingDirectory)?.Parent?.Parent?.FullName;
            var path = Path.Combine(projectDirectory, "Data", seller.ToString());
            Directory.CreateDirectory(path);
            return Path.Combine(path, fileName);
        }

        private static string CreateLogDir()
        {
            var dir = Directory.GetParent(Environment.CurrentDirectory).Parent.FullName;
            var createDir = Directory.CreateDirectory(dir + "\\Logs\\");
            return createDir.FullName;
        }

        public static string Slugify(string text)
        {
            // Convert to lowercase
            text = text.ToLowerInvariant();

            // Remove all accents and diacritics
            text = RemoveDiacritics(text);

            // Replace spaces with hyphens
            text = text.Replace(" ", "-");

            // Remove invalid chars
            text = Regex.Replace(text, @"[^a-z0-9\s-]", "");

            // Replace multiple hyphens with a single hyphen
            text = Regex.Replace(text, @"-+", "-");

            // Trim hyphens from the start and end of the string
            text = text.Trim('-');

            return text;
        }

        private static string RemoveDiacritics(string text)
        {
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }
    }

    public static class Extensions
    {
        public static string ToSafeID(this string ID)
        {
            var regex = new Regex("[^A-Za-z0-9-_.]");
            return regex.Replace(ID, "_");
        }
    }
}
