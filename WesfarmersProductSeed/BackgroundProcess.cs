using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace WesfarmersSeed
{
    public class BackgroundProcess : BackgroundService
    {
        private readonly BunningsProductExportPipeline _bunningsExportPipeline;
        private readonly BunningsProductImportPipeline _bunningsImportPipeline;
        private readonly CatchProductImportPipeline _catchProductImportPipeline;
        private readonly IHostApplicationLifetime appLifetime;

        public BackgroundProcess(
            BunningsProductExportPipeline bunningsExportPipeline,
            BunningsProductImportPipeline bunningsImportPipeline,
            CatchProductImportPipeline catchImportPipeline,
            IHostApplicationLifetime appLifetime) 
        { 
            _bunningsExportPipeline = bunningsExportPipeline;
            _bunningsImportPipeline = bunningsImportPipeline;
            _catchProductImportPipeline = catchImportPipeline;
            this.appLifetime = appLifetime;
        }

        protected override async Task ExecuteAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("Background process starting...");
            Console.ForegroundColor = ConsoleColor.White;

            try
            {
                //await _bunningsExportPipeline.Run();
                // await _importPipeline.BuildCategoriesAsync();
                //await _importPipeline.ImportProductsAsync("6011");
                // await _importPipeline.ImportProductsAsync("6035");
                //await _importPipeline.ImportProductsAsync("6042");
                await _catchProductImportPipeline.CreateInventoryRecords();
                Console.WriteLine("Background process completed successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during background process: {ex.Message}");
            }
            finally
            {
                appLifetime.StopApplication();
            }
        }
    }
}
