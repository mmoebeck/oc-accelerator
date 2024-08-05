using OrderCloud.SDK;
using System;
using System.Collections.Generic;
using System.Globalization;
using CsvHelper.Configuration;
using Newtonsoft.Json;

namespace WesfarmersSeed
{

    public class Token
    {
        public string access_token { get; set; }
        public int expires_in { get; set; }
        public string token_type { get; set; }
        public string scope { get; set; }
    }

    public class Items
    {
        public List<Result> results { get; set; }
        public List<Facet> facets { get; set; }
        public Meta _meta { get; set; }
        public List<Links> _links { get; set; }
    }

    public class Meta
    {
        public string ContinuationToken { get; set; }
    }

    public class Result
    {
        public string title { get; set; }
        public string itemNumber { get; set; }
        public Meta1 _meta { get; set; }
        public List<Links> _links { get; set; }
    }

    public class Meta1
    {
        public string countryCode { get; set; }
        public string itemNumber { get; set; }
    }

    public class Links
    {
        public string rel { get; set; }
        public string href { get; set; }
        public List<string> methods { get; set; }
    }

    public class Facet
    {
        public string id { get; set; }
        public string displayName { get; set; }
        public string type { get; set; }
        public List<Value> values { get; set; }
    }

    public class Value
    {
        public string displayName { get; set; }
        public bool isSelected { get; set; }
        public int resultCount { get; set; }
        public string value { get; set; }
        public bool endInclusive { get; set; }
        public int startRange { get; set; }
        public float endRange { get; set; }
    }

    // details object

    public class Details
    {
        public Item[] items { get; set; }
        public _Meta _meta { get; set; }
        public _Links1[] _links { get; set; }
    }

    public class _Meta
    {
        public string _objectUuid { get; set; }
        public string _objectVersion { get; set; }
        public string countryCode { get; set; }
        public string itemNumber { get; set; }
        public string locationCode { get; set; }
    }

    public class Item
    {
        public string itemNumber { get; set; }
        public string brand { get; set; }
        public Description description { get; set; }
        public string unspscCode { get; set; }
        public DateTime startDate { get; set; }
        public DateTime lastUpdate { get; set; }
        public Taxinformation taxInformation { get; set; }
        public string itemType { get; set; }
        public Minimumgrade[] minimumGrades { get; set; }
        public string saleUnitOfMeasure { get; set; }
        public string productOffer { get; set; }
        public Barcode[] barcodes { get; set; }
        public Zoninginformation[] zoningInformation { get; set; }
        public bool wholeUnitOnly { get; set; }
        public bool searchable { get; set; }
        public bool sellable { get; set; }
        public bool tradeOnlyItem { get; set; }
        public Saleuomsplittingrules saleUomSplittingRules { get; set; }
        public Relationship[] relationships { get; set; }
        public Correlation correlation { get; set; }
        public _Meta1 _meta { get; set; }
        public _Links[] _links { get; set; }
        public Enricheddata enrichedData { get; set; }
        public Packaginghierarchy packagingHierarchy { get; set; }
    }

    public class Description
    {
        public string sectionDescription { get; set; }
        public string productDescription { get; set; }
    }

    public class Taxinformation
    {
        public string taxCode { get; set; }
        public int taxRate { get; set; }
    }

    public class Saleuomsplittingrules
    {
        public float increment { get; set; }
    }

    public class Correlation
    {
        public string correlationId { get; set; }
        public bool commonItemNumberFlag { get; set; }
    }

    public class _Meta1
    {
        public string _objectUuid { get; set; }
        public string _objectVersion { get; set; }
        public string countryCode { get; set; }
        public string itemNumber { get; set; }
    }

    public class Enricheddata
    {
        public string name { get; set; }
        public string origin { get; set; }
        public string description { get; set; }
        public Baseproduct baseProduct { get; set; }
        public Variantvaluecategory[] variantValueCategories { get; set; }
        public Brand brand { get; set; }
        public Otherimage[] otherImages { get; set; }
        public object[] videos { get; set; }
        public string[] keySellingPoints { get; set; }
        public string[] microSiteKeySellingPoint { get; set; }
        public string warrantyInformation { get; set; }
        public string installationInformation { get; set; }
        public string sustainabilityInformation { get; set; }
        public string deliveryInformation { get; set; }
        public bool showServices { get; set; }
        public Availableservice[] availableServices { get; set; }
        public Productdimension[] productDimensions { get; set; }
        public Classification classification { get; set; }
        public bool forHireFlag { get; set; }
        public bool fscFlag { get; set; }
        public bool bestSellerFlag { get; set; }
        public bool newArrivalFlag { get; set; }
        public Picture picture { get; set; }
        public string size { get; set; }
        public string weight { get; set; }
        public string volume { get; set; }
        public string modelName { get; set; }
        public string modelNumber { get; set; }
        public string colour { get; set; }
        public string familyColour { get; set; }
        public string hexCodeColour { get; set; }
        public string material { get; set; }
        public Supplier[] suppliers { get; set; }
        public string isWebVisible { get; set; }
        public string webPurchasable { get; set; }
        public Navcategory[] navCategories { get; set; }
        public string familyTree { get; set; }
    }

    public class Baseproduct
    {
        public string code { get; set; }
        public string name { get; set; }
        public bool isDummy { get; set; }
        public string[] variantCategories { get; set; }
    }

    public class Brand
    {
        public string code { get; set; }
        public string name { get; set; }
        public bool leadingBrand { get; set; }
        public bool tradeBrand { get; set; }
        public bool marketplaceBrand { get; set; }
        public string description { get; set; }
        public Logo logo { get; set; }
    }

    public class Logo
    {
        public string code { get; set; }
        public string primaryAssetURL { get; set; }
        public string mime { get; set; }
        public string associatedTo { get; set; }
        public bool associatedToSpecified { get; set; }
    }

    public class Classification
    {
        public string code { get; set; }
        public string name { get; set; }
        public Feature[] features { get; set; }
    }

    public class Feature
    {
        public string attributeName { get; set; }
        public string attributeValue { get; set; }
    }

    public class Picture
    {
        public string code { get; set; }
        public string primaryAssetURL { get; set; }
        public string mime { get; set; }
        public string associatedTo { get; set; }
        public bool associatedToSpecified { get; set; }
    }

    public class Variantvaluecategory
    {
        public string variantValueCategory { get; set; }
        public string variantCategory { get; set; }
    }

    public class Otherimage
    {
        public string code { get; set; }
        public string primaryAssetURL { get; set; }
        public string mime { get; set; }
        public string associatedTo { get; set; }
        public bool associatedToSpecified { get; set; }
    }

    public class Availableservice
    {
        public string serviceName { get; set; }
        public string serviceID { get; set; }
        public string description { get; set; }
        public string serviceIcon { get; set; }
        public bool serviceStatus { get; set; }
        public string batchCountry { get; set; }
    }

    public class Productdimension
    {
        public string productDimensionLabel { get; set; }
        public decimal productDimensionWidth { get; set; }
        public decimal productDimensionHeight { get; set; }
        public decimal productDimensionDepth { get; set; }
    }

    public class Supplier
    {
        public string code { get; set; }
        public string name { get; set; }
    }

    public class Navcategory
    {
        public string code { get; set; }
        public string name { get; set; }
        public string level { get; set; }
    }

    public class NavCategoryWithParent : Navcategory
    {
        public string parentCode { get; set; }
    }

    public class Packaginghierarchy
    {
        public Outerbarcodes outerBarcodes { get; set; }
    }

    public class Outerbarcodes
    {
        public object[] barcode { get; set; }
    }

    public class Minimumgrade
    {
        public string locationType { get; set; }
        public string grade { get; set; }
    }

    public class Barcode
    {
        public string number { get; set; }
        public string level { get; set; }
        public Packaging[] packaging { get; set; }
        public Hierarchy hierarchy { get; set; }
    }

    public class Hierarchy
    {
        public string childBarcode { get; set; }
        public int childQuantity { get; set; }
        public string baseUnitBarcode { get; set; }
        public int baseUnitQuantity { get; set; }
    }

    public class Packaging
    {
        public int part { get; set; }
        public Dimension dimension { get; set; }
        public Volume volume { get; set; }
        public Weight weight { get; set; }
    }

    public class Dimension
    {
        public string unitOfMeasure { get; set; }
        public float length { get; set; }
        public float width { get; set; }
        public float height { get; set; }
    }

    public class Volume
    {
        public string unitOfMeasure { get; set; }
        public float value { get; set; }
    }

    public class Weight
    {
        public string unitOfMeasure { get; set; }
        public float net { get; set; }
        public float gross { get; set; }
    }

    public class Zoninginformation
    {
        public string retailZone { get; set; }
        public string region { get; set; }
        public string status { get; set; }
        public object[] restrictions { get; set; }
        public Pendingstatus pendingStatus { get; set; }
    }

    public class Pendingstatus
    {
        public string status { get; set; }
        public DateTime date { get; set; }
    }

    public class Relationship
    {
        public string type { get; set; }
        public Linkedtimberparentrelationship linkedTimberParentRelationship { get; set; }
    }

    public class Linkedtimberparentrelationship
    {
        public string parentItemNumber { get; set; }
        public float MultipleOfParent { get; set; }
    }

    public class _Links
    {
        public string rel { get; set; }
        public string href { get; set; }
        public string[] methods { get; set; }
    }

    public class _Links1
    {
        public string rel { get; set; }
        public string href { get; set; }
        public string[] methods { get; set; }
    }

    public class XpImage
    {
        public string Url { get; set; }
        public string ThumbnailUrl { get; set; }
    }

    public class BunningsOcProduct : Product<BunningsOcProductXp>
    {

    }

    public class BunningsOcProductXp
    {
        public string BaseProductCode { get; set; }
        public string Brand { get; set; }
        public string[] KeySellingPoints { get; set; }
        public XpImage[] Images { get; set; }
        public string Colour { get; set; }
        public string Material { get; set; }
        public string ModelName { get; set; }
        public string ModelNumber { get; set; }
        public Navcategory[] NavCategories { get; set; }
    }

    public class CatchOcProductXp
    {
        public XpImage[] Images { get; set; }
        public CatchFacets Facets { get; set; }
        public string Url { get; set; }
    }

    public class CatchFacets
    {
        public decimal Price { get; set; }
    }

    public class CatchOcProduct : Product
    {

    }

    public class CatchItem
    {
        public string id { get; set; }
        public string item_name { get; set; }
        public string url { get; set; }
        public string image_url { get; set; }
        public string group_ids { get; set; }
        public string description { get; set; }
        public string keywords { get; set; }
        public string facet_brand { get; set; }
        public decimal facet_price { get; set; }
        public string facet_fulfil_by { get; set; }
        public string facet_one_pass_exclusive { get; set; }
        public string facet_sold_by { get; set; }
        public string facet_free_delivery { get; set; }
        public string facet_adult { get; set; }
        public string facet_personalised_product { get; set; }
        public string facet_has_dangerous_goods { get; set; }
        public string facet_sensitive { get; set; }
        public string facet_age_restricted { get; set; }
        public string facet_dual_pricing { get; set; }
        public string facet_express_delivery { get; set; }
        public string facet_average_rating { get; set; }
        public string facet_date_added { get; set; }
        public string facet_one_pass_eligible { get; set; }
        public string facet_click_and_collect { get; set; }
        public string facet_discount_percentage { get; set; }
        public string facet_one_pass_discount_percentage { get; set; }
        public string facet_baby_size { get; set; }
        public string facet_child_size { get; set; }
        public string facet_youth_size { get; set; }
        public string facet_options { get; set; }
        public string facet_us_infant_shoes { get; set; }
        public string facet_variant_colour_value { get; set; }
        public string facet_neck_and_sleeve { get; set; }
        public string facet_us_kids_size { get; set; }
        public string facet_variant_size_value { get; set; }
        public string facet_size_ { get; set; }
        public string facet_waist_and_length { get; set; }
        public string facet_ugg_size { get; set; }
        public string facet_colour { get; set; }
        public string facet_uk_size_2 { get; set; }
        public string facet_au_size { get; set; }
        public string facet_uk_eu_kids_size_clarks { get; set; }
        public string facet_us_size { get; set; }
        public string facet_colour_new { get; set; }
        public string facet_bedding_size { get; set; }
        public string facet_havaiana_size { get; set; }
        public string facet_uk_size { get; set; }
        public string facet_eu_size { get; set; }
        public string facet_skins_size { get; set; }
        public string facet_kids_size { get; set; }
        public string facet_size { get; set; }
        public string facet_bra_size { get; set; }
        public string facet_eur_womens_shoes { get; set; }
        public string facet_weight { get; set; }
        public string facet_hosiery_size { get; set; }
        public string facet_mens_eu_shoes { get; set; }
        public string facet_product_options { get; set; }
        public string facet_color { get; set; }
        public string facet_t_shirt_size { get; set; }
        public string facet_dns { get; set; }
        public string facet_junior_size { get; set; }
        public string facet_glove_size { get; set; }
        public string facet_uk_kids_clarks { get; set; }
        public string facet_select_size { get; set; }
        public string facet_uk_clarks_junior_adult_female { get; set; }
        public string facet_weatherbeeta_size { get; set; }
        public string facet_lens_strength { get; set; }
        public string facet_colour_and_size { get; set; }
        public string facet_racquet_size { get; set; }
        public string facet_jacket_size { get; set; }
        public string facet_uk_clarks_junior_adult_male { get; set; }
        public string facet_clarks_dns { get; set; }
        public string facet_size_selection { get; set; }
        public string facet_luxury_living_bedding_color { get; set; }
        public string facet_option { get; set; }
        public string facet_nappy_size { get; set; }
        public string facet_maybelline_expert_wear_eyeshadow { get; set; }
        public decimal metadata_price { get; set; }
        public string metadata_adult { get; set; }
    }
    public class CatchVariation
    {
        public string variation_id { get; set; }
        public string item_id { get; set; }
        public string image_url { get; set; }
        public string url { get; set; }
        public string facet_adult { get; set; }
        public string facet_personalised_product { get; set; }
        public string facet_has_dangerous_goods { get; set; }
        public string facet_sensitive { get; set; }
        public string facet_age_restricted { get; set; }
        public string facet_average_rating { get; set; }
        public string facet_gender { get; set; }
        public string facet_flash_sale_item { get; set; }
        public string facet_material { get; set; }
        public string facet_core { get; set; }
        public string facet_model_number { get; set; }
        public string facet_season { get; set; }
        public string facet_womens_footwear_size { get; set; }
        public string facet_colour { get; set; }
        public string facet_dangerous_goods { get; set; }
        public string facet_combination { get; set; }
        public string facet_event_keyword { get; set; }
        public string facet_mens_footwear_size { get; set; }
        public string facet_womens_pants_shorts_jeans_underwear_size { get; set; }
        public string facet_bedding_size { get; set; }
        public string facet_capacity_volume { get; set; }
        public string metadata_adult { get; set; }
    }
    public class CatchItemGroup
    {
        public string id { get; set; }
        public string parent_id { get; set; }
        public string name { get; set; }
        public string data { get; set; }
    }

    public class Prices
    {
        public List<Price> prices { get; set; }
    }

    public class Price
    {
        public string itemNumber { get; set; }
        public float unitPrice { get; set; }
        public float lineUnitPrice { get; set; }
        public string priceId { get; set; }
        public string _class { get; set; }
        public _Meta _meta { get; set; }
        public _Links[] _links { get; set; }
    }

    public class Pricing
    {
        public Context context { get; set; }
        public List<PriceItem> items { get; set; }
    }

    public class Context
    {
        public string country { get; set; }
        public string location { get; set; }
    }

    public class PriceItem
    {
        public string itemNumber { get; set; }
    }

    public class Inventory
    {
        public string itemNumber { get; set; }
        public string countryCode { get; set; }
        public string locationCode { get; set; }
        public int stockCount { get; set; }
        public string levelIndicator { get; set; }
        public _Meta _meta { get; set; }
        public _Links[] _links { get; set; }
    }

    public enum Seller
    {
        Catch = 0,
        Bunnings = 1
    }
}
