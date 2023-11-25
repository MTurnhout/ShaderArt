function initAnimation() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    setInterval(() => {
        draw(ctx, canvas);
    }, 1000 / 24);
}

function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const resolution = { x: canvas.width, y: canvas.height };
    const time = Date.now() / 1000;
    
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            const color = getColor({ x, y }, resolution, time);

            const index = (x + y * imageData.width) * 4;
            pixels[index] = color.x * 255;
            pixels[index + 1] = color.y * 255;
            pixels[index + 2] = color.z * 255;
            pixels[index + 3] = color.w * 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getColor(fragCoord: vec2, resolution: vec2, time: number): vec4 {
    const uv: vec2 = {
        x: (fragCoord.x * 2.0 - resolution.x) / resolution.y,
        y: (fragCoord.y * 2.0 - resolution.y) / resolution.y
    };
    const uv0: vec2 = {
        x: uv.x,
        y: uv.y
    };
    const finalColor: vec4 = {
        x: 0,
        y: 0,
        z: 0,
        w: 1
    };

    for (let i = 0; i < 4.0; i++) {
        uv.x = fract(uv.x * 1.5) - 0.5;
        uv.y = fract(uv.y * 1.5) - 0.5;

        let d: number = lengthX(uv) * Math.exp(-lengthX(uv0));
        let col: vec3 = palette(lengthX(uv0) + i * 0.4 + time * 0.4);

        d = Math.sin(d * 8 + time) / 8;
        d = Math.abs(d);

        d = Math.pow(0.01 / d, 1.2);

        finalColor.x += col.x * d;
        finalColor.y += col.y * d;
        finalColor.z += col.z * d;
    }

    return finalColor;
}

function fract(x: number): number {
    return x - Math.floor(x);
}

function lengthX(v: vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function palette(t: number): vec3 {
    const a: vec3 = { x: 0.5, y: 0.5, z: 0.5 };
    const b: vec3 = { x: 0.5, y: 0.5, z: 0.5 };
    const c: vec3 = { x: 1.0, y: 1.0, z: 1.0 };
    const d: vec3 = { x: 0.263, y: 0.416, z: 0.557 };

    return {
        x: a.x + b.x * Math.cos(6.28318 * (c.x * t + d.x)),
        y: a.y + b.y * Math.cos(6.28318 * (c.y * t + d.y)),
        z: a.z + b.z * Math.cos(6.28318 * (c.z * t + d.z))
    };
}

interface vec2 {
    x: number;
    y: number;
}

interface vec3 {
    x: number;
    y: number;
    z: number;
}

interface vec4 {
    x: number;
    y: number;
    z: number;
    w: number;
}