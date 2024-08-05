using System;
using System.Collections.Generic;
using System.Text;

namespace WesfarmersSeed
{
    public class AppSettings
    {
        public BunningsAppSettings Bunnings { get; set; }
        public OrderCloudAppSettings OrderCloud { get; set; }
    }

    public class BunningsAppSettings
    {
        public string AuthUrl { get; set; }
        public string BaseUrl { get; set; }
        public string ClientID { get; set; }
        public string ClientSecret { get; set; }
        public string Scope { get; set; }
        public string GrantType { get; set; }
    }

    public class OrderCloudAppSettings
    {
        public string ApiUrl { get; set; }
        public string MiddlewareClientID { get; set; }
        public string MiddlewareClientSecret { get; set; }
        public string BunningsCatalogID { get; set; }
        public string CatchCatalogID { get; set; }
    }
}
