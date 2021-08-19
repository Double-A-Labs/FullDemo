using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SaberDemo.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace SaberDemo.Controllers
{
    public class VideoChatController : Controller
    {
        private readonly ILogger<VideoChatController> _logger;

        public VideoChatController(ILogger<VideoChatController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public static async Task Stream(WebSocket socket)
        {
            var buffer = new ArraySegment<byte>(new byte[4 * 1024]);
            WebSocketReceiveResult result;
            do
            {
                await using var ms = new MemoryStream();
                do
                {
                    result = await socket.ReceiveAsync(buffer, CancellationToken.None);
                    Console.Write($"Receiving Message");
                    if (buffer.Array != null)
                    {
                        ms.Write(buffer.Array, buffer.Offset, result.Count);
                        Console.Write($"Writing Message is {ms.ToArray().Length} bytes\n");
                    }
                } while (!result.EndOfMessage);

                if (result.MessageType != WebSocketMessageType.Close)
                {
                    var message = ms.ToArray();
                    Console.Write($"Message is {message.Length} bytes\n");

                    await socket.SendAsync(message, result.MessageType, result.EndOfMessage, CancellationToken.None);
                    Console.Write($"Message is sending from server");
                }
            } while (!result.CloseStatus.HasValue);

            await socket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }

/*        public static async Task Capture(WebSocket socket)
        {
            var buffer = new ArraySegment<byte>(new byte[4 * 1024]);

            var counter = 0;

            WebSocketReceiveResult result;
            do
            {
                var file = $"{Environment.CurrentDirectory}/Captures/video_{counter++}.bin";
                await using var fileStream = System.IO.File.Open(file, FileMode.Append, FileAccess.Write);

                await using var ms = new MemoryStream();

                do
                {
                    result = await socket.ReceiveAsync(buffer, CancellationToken.None);
                    Console.Write($"Receiving Message");
                    if (buffer.Array != null)
                    {
                        ms.Write(buffer.Array, buffer.Offset, result.Count);
                        Console.Write($"Writing Message is {ms.ToArray().Length} bytes\n");
                    }
                } while (!result.EndOfMessage);

                if (result.MessageType != WebSocketMessageType.Close)
                {
                    var message = ms.ToArray();
                    await fileStream.WriteAsync(message, CancellationToken.None);
                    Console.Write($"Message of {message.Length} bytes written to {file}\n");
                }
            } while (!result.CloseStatus.HasValue);

            await socket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }*/

/*        public static async Task Replay(WebSocket socket)
        {
            var recording = "1";

            for (var i = 0; i < 100; i++)
            {
                var file = $"{Environment.CurrentDirectory}/Captures/{recording}-{i}.bin";

                var bytes = await System.IO.File.ReadAllBytesAsync(file, CancellationToken.None);

                await socket.SendAsync(bytes, WebSocketMessageType.Binary, true, CancellationToken.None);
            }
        }*/
    }
}
