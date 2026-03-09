$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = [System.IO.File]::ReadAllText("$folder\index.html", [System.Text.Encoding]::UTF8)
$css  = [System.IO.File]::ReadAllText("$folder\style.css",  [System.Text.Encoding]::UTF8)
$js   = [System.IO.File]::ReadAllText("$folder\script.js",  [System.Text.Encoding]::UTF8)

# Inject CSS inline (replace external <link>)
$cssBlock = "<style>`r`n$css`r`n</style>"
$html = $html -replace '<link rel="stylesheet" href="style\.css" />', $cssBlock

# Inject JS inline (replace external <script>)
$jsBlock = "<script>`r`n$js`r`n</script>"
$html = $html -replace '<script src="script\.js"></script>', $jsBlock

$out = "$folder\portfolio-standalone.html"
[System.IO.File]::WriteAllText($out, $html, [System.Text.Encoding]::UTF8)

$size = [math]::Round((Get-Item $out).Length / 1KB, 1)
Write-Host "Fichier cree : $out ($size KB)"
