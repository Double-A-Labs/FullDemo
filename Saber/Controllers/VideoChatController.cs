using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SaberDemo.Models;
using System;
using System.Diagnostics;
using System.IO;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

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

        public static async Task StreamTest(WebSocket socket)
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
    }
}
