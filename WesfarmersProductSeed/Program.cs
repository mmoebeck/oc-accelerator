using WesfarmersSeed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderCloud.SDK;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((context, config) => config.AddJsonFile("appSettings.json", optional: false))
    .ConfigureServices((context, services) =>
    {

        // read and bind app settings
        var appSettings = new AppSettings();
        context.Configuration.Bind(appSettings);
        services.Configure<AppSettings>(context.Configuration);

        // configure services
        services
            .AddSingleton(appSettings)
            .AddSingleton(new BunningsSDK(appSettings))
            .AddSingleton<IOrderCloudClient>(provider => new OrderCloudClient(new OrderCloudClientConfig
            {
                ApiUrl = appSettings.OrderCloud.ApiUrl,
                AuthUrl = appSettings.OrderCloud.ApiUrl,
                ClientId = appSettings.OrderCloud.MiddlewareClientID,
                ClientSecret = appSettings.OrderCloud.MiddlewareClientSecret,
                Roles = [ApiRole.FullAccess],
            }))
            .AddSingleton<BunningsProductExportPipeline>()
            .AddSingleton<BunningsProductImportPipeline>()
            .AddSingleton<CatchProductImportPipeline>();

        services.AddHostedService<BackgroundProcess>();
    })
    .Build();

await host.RunAsync();