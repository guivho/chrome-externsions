Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile("$env:USERPROFILE\_Downloads\mijn_screenshot.png")
$canvas = New-Object System.Drawing.Bitmap(640, 400)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.Clear([System.Drawing.Color]::FromArgb(249, 249, 249)) # achtergrondkleur van je optiepagina

# Centreer de afbeelding op het canvas
$x = [math]::Max(0, [int]((1280 - $source.Width) / 2))
$y = [math]::Max(0, [int]((800 - $source.Height) / 2))
$g.DrawImage($source, $x, $y, $source.Width, $source.Height)

$canvas.SetResolution(72, 72)
$canvas.Save("$env:USERPROFILE\_Downloads\real_screenshot_640x400.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$source.Dispose()
$canvas.Dispose()
