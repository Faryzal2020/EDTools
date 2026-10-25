Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Text;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

public class KeyHookSender {
    [DllImport("user32.dll")]
    public static extern short GetAsyncKeyState(int vKey);

    public static Dictionary<int, string> KeyMap = new Dictionary<int, string>() {
        { 0x1B, "Key_Escape" },
        { 0x70, "Key_F1" }, { 0x71, "Key_F2" }, { 0x72, "Key_F3" }, { 0x73, "Key_F4" },
        { 0x74, "Key_F5" }, { 0x75, "Key_F6" }, { 0x76, "Key_F7" }, { 0x77, "Key_F8" },
        { 0x78, "Key_F9" }, { 0x79, "Key_F10" }, { 0x7A, "Key_F11" }, { 0x7B, "Key_F12" },
        { 0xC0, "Key_Grave" },
        { 0x31, "Key_1" }, { 0x32, "Key_2" }, { 0x33, "Key_3" }, { 0x34, "Key_4" }, { 0x35, "Key_5" },
        { 0x36, "Key_6" }, { 0x37, "Key_7" }, { 0x38, "Key_8" }, { 0x39, "Key_9" }, { 0x30, "Key_0" },
        { 0xBD, "Key_Minus" }, { 0xBB, "Key_Equals" }, { 0x08, "Key_Backspace" },
        { 0x09, "Key_Tab" },
        { 0x51, "Key_Q" }, { 0x57, "Key_W" }, { 0x45, "Key_E" }, { 0x52, "Key_R" }, { 0x54, "Key_T" },
        { 0x59, "Key_Y" }, { 0x55, "Key_U" }, { 0x49, "Key_I" }, { 0x4F, "Key_O" }, { 0x50, "Key_P" },
        { 0xDB, "Key_LeftBracket" }, { 0xDD, "Key_RightBracket" }, { 0xDC, "Key_BackSlash" },
        { 0x14, "Key_CapsLock" },
        { 0x41, "Key_A" }, { 0x53, "Key_S" }, { 0x44, "Key_D" }, { 0x46, "Key_F" }, { 0x47, "Key_G" },
        { 0x48, "Key_H" }, { 0x4A, "Key_J" }, { 0x4B, "Key_K" }, { 0x4C, "Key_L" },
        { 0xBA, "Key_SemiColon" }, { 0xDE, "Key_Apostrophe" }, { 0x0D, "Key_Enter" },
        { 0xA0, "Key_LeftShift" }, { 0xA1, "Key_RightShift" },
        { 0x5A, "Key_Z" }, { 0x58, "Key_X" }, { 0x43, "Key_C" }, { 0x56, "Key_V" }, { 0x42, "Key_B" },
        { 0x4E, "Key_N" }, { 0x4D, "Key_M" }, { 0xBC, "Key_Comma" }, { 0xBE, "Key_Period" }, { 0xBF, "Key_Slash" },
        { 0xA2, "Key_LeftControl" }, { 0xA3, "Key_RightControl" },
        { 0xA4, "Key_LeftAlt" }, { 0xA5, "Key_RightAlt" },
        { 0x20, "Key_Space" },
        { 0x2D, "Key_Insert" }, { 0x24, "Key_Home" }, { 0x21, "Key_PageUp" },
        { 0x2E, "Key_Delete" }, { 0x23, "Key_End" }, { 0x22, "Key_PageDown" },
        { 0x26, "Key_UpArrow" }, { 0x25, "Key_LeftArrow" }, { 0x28, "Key_DownArrow" }, { 0x27, "Key_RightArrow" },
        { 0x90, "Key_NumLock" }, { 0x6F, "Key_Numpad_Divide" }, { 0x6A, "Key_Numpad_Multiply" }, { 0x6D, "Key_Numpad_Subtract" },
        { 0x67, "Key_Numpad_7" }, { 0x68, "Key_Numpad_8" }, { 0x69, "Key_Numpad_9" }, { 0x6B, "Key_Numpad_Add" },
        { 0x64, "Key_Numpad_4" }, { 0x65, "Key_Numpad_5" }, { 0x66, "Key_Numpad_6" },
        { 0x61, "Key_Numpad_1" }, { 0x62, "Key_Numpad_2" }, { 0x63, "Key_Numpad_3" },
        { 0x60, "Key_Numpad_0" }, { 0x6E, "Key_Numpad_Decimal" }
    };

    private static HashSet<int> lastDown = new HashSet<int>();
    private static ClientWebSocket ws = null;
    private static Uri serverUri = new Uri("ws://localhost:3000/ws");
    private static DateTime lastConnectAttempt = DateTime.MinValue;

    public static async Task EnsureConnected() {
        if (ws != null && ws.State == WebSocketState.Open) return;
        if ((DateTime.Now - lastConnectAttempt).TotalSeconds < 2) return;
        lastConnectAttempt = DateTime.Now;

        try {
            if (ws != null) {
                ws.Dispose();
            }
            ws = new ClientWebSocket();
            using (var cts = new CancellationTokenSource(1500)) {
                await ws.ConnectAsync(serverUri, cts.Token);
            }
        } catch {
            ws = null;
        }
    }

    public static async Task SendEvent(string json) {
        if (ws != null && ws.State == WebSocketState.Open) {
            try {
                var bytes = Encoding.UTF8.GetBytes(json);
                await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
            } catch {
                ws = null;
            }
        }
    }

    public static List<string> PollEvents() {
        var list = new List<string>();

        bool lshift = (GetAsyncKeyState(0xA0) & 0x8000) != 0;
        bool rshift = (GetAsyncKeyState(0xA1) & 0x8000) != 0;
        bool lctrl  = (GetAsyncKeyState(0xA2) & 0x8000) != 0;
        bool rctrl  = (GetAsyncKeyState(0xA3) & 0x8000) != 0;
        bool lalt   = (GetAsyncKeyState(0xA4) & 0x8000) != 0;
        bool ralt   = (GetAsyncKeyState(0xA5) & 0x8000) != 0;

        var mods = new List<string>();
        if (lshift) mods.Add("\"Key_LeftShift\"");
        if (rshift) mods.Add("\"Key_RightShift\"");
        if (lctrl)  mods.Add("\"Key_LeftControl\"");
        if (rctrl)  mods.Add("\"Key_RightControl\"");
        if (lalt)   mods.Add("\"Key_LeftAlt\"");
        if (ralt)   mods.Add("\"Key_RightAlt\"");
        string modStr = string.Join(",", mods.ToArray());

        var currentDown = new HashSet<int>();

        foreach (var kvp in KeyMap) {
            int vk = kvp.Key;
            bool isDown = (GetAsyncKeyState(vk) & 0x8000) != 0;
            if (isDown) {
                currentDown.Add(vk);
                if (!lastDown.Contains(vk)) {
                    list.Add(string.Format("{{\"type\":\"keyEvent\",\"event\":\"keydown\",\"key\":\"{0}\",\"vk\":{1},\"modifiers\":[{2}]}}", kvp.Value, vk, modStr));
                }
            } else {
                if (lastDown.Contains(vk)) {
                    list.Add(string.Format("{{\"type\":\"keyEvent\",\"event\":\"keyup\",\"key\":\"{0}\",\"vk\":{1},\"modifiers\":[{2}]}}", kvp.Value, vk, modStr));
                }
            }
        }

        lastDown = currentDown;
        return list;
    }
}
"@ -ErrorAction SilentlyContinue

Write-Host "[EDTools KeyListener] Hook active. Connecting to ws://localhost:3000/ws..."
while ($true) {
    [KeyHookSender]::EnsureConnected().Wait()
    $events = [KeyHookSender]::PollEvents()
    foreach ($ev in $events) {
        [KeyHookSender]::SendEvent($ev).Wait()
    }
    Start-Sleep -Milliseconds 8
}
