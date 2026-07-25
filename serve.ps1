$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host "Server listening on http://localhost:8080"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        
        # Prevent directory traversal
        $fullPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $path))
        $basePath = [System.IO.Path]::GetFullPath((Get-Location).Path)
        
        if ($fullPath.StartsWith($basePath) -and (Test-Path $fullPath -PathType Leaf)) {
            $content = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $content.Length
            
            if ($path -match '\.html$') { $response.ContentType = 'text/html; charset=utf-8' }
            elseif ($path -match '\.css$') { $response.ContentType = 'text/css; charset=utf-8' }
            elseif ($path -match '\.js$') { $response.ContentType = 'application/javascript; charset=utf-8' }
            elseif ($path -match '\.jpg$') { $response.ContentType = 'image/jpeg' }
            
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
