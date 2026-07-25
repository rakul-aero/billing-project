$port = 8080
$root = $PSScriptRoot

# TcpListener binds to 0.0.0.0 (all IP addresses) without requiring admin elevation
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
$listener.Start()

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -First 1).IPAddress

Write-Host "============================================"
Write-Host "  Bill With Me - Mobile Web Server Running!"
Write-Host "  PC Link:     http://localhost:$port"
Write-Host "  Mobile Link: http://${ip}:$port"
Write-Host "  (Ensure Phone & PC are on same Wi-Fi)"
Write-Host "============================================"

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)
        
        $line = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($line)) { $client.Close(); continue }
        
        $parts = $line.Split(' ')
        if ($parts.Length -lt 2) { $client.Close(); continue }
        
        $rawPath = $parts[1].Split('?')[0].TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawPath)) { $rawPath = "index.html" }
        
        $filePath = Join-Path $root $rawPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".png"  { "image/png" }
                ".json" { "application/json" }
                ".svg"  { "image/svg+xml" }
                default { "application/octet-stream" }
            }
            
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
            
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $msg = "HTTP/1.1 404 Not Found`r`nContent-Length: 13`r`nConnection: close`r`n`r`n404 Not Found"
            $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $stream.Write($b, 0, $b.Length)
        }
        
        $stream.Flush()
        $client.Close()
    } catch {}
}
