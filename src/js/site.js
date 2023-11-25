function initAnimation() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    setInterval(function () {
        draw(ctx, canvas);
    }, 1000 / 24);
}
function draw(ctx, canvas) {
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    var resolution = { x: canvas.width, y: canvas.height };
    var time = Date.now() / 1000;
    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var color = getColor({ x: x, y: y }, resolution, time);
            var index = (x + y * imageData.width) * 4;
            pixels[index] = color.x * 255;
            pixels[index + 1] = color.y * 255;
            pixels[index + 2] = color.z * 255;
            pixels[index + 3] = color.w * 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
function getColor(fragCoord, resolution, time) {
    var uv = {
        x: (fragCoord.x * 2.0 - resolution.x) / resolution.y,
        y: (fragCoord.y * 2.0 - resolution.y) / resolution.y
    };
    var uv0 = {
        x: uv.x,
        y: uv.y
    };
    var finalColor = {
        x: 0,
        y: 0,
        z: 0,
        w: 1
    };
    for (var i = 0; i < 4.0; i++) {
        uv.x = fract(uv.x * 1.5) - 0.5;
        uv.y = fract(uv.y * 1.5) - 0.5;
        var d = lengthX(uv) * Math.exp(-lengthX(uv0));
        var col = palette(lengthX(uv0) + i * 0.4 + time * 0.4);
        d = Math.sin(d * 8 + time) / 8;
        d = Math.abs(d);
        d = Math.pow(0.01 / d, 1.2);
        finalColor.x += col.x * d;
        finalColor.y += col.y * d;
        finalColor.z += col.z * d;
    }
    return finalColor;
}
function fract(x) {
    return x - Math.floor(x);
}
function lengthX(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
function palette(t) {
    var a = { x: 0.5, y: 0.5, z: 0.5 };
    var b = { x: 0.5, y: 0.5, z: 0.5 };
    var c = { x: 1.0, y: 1.0, z: 1.0 };
    var d = { x: 0.263, y: 0.416, z: 0.557 };
    return {
        x: a.x + b.x * Math.cos(6.28318 * (c.x * t + d.x)),
        y: a.y + b.y * Math.cos(6.28318 * (c.y * t + d.y)),
        z: a.z + b.z * Math.cos(6.28318 * (c.z * t + d.z))
    };
}
