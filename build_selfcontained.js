async function genCode(){
    let css = await fetch("https://cors.explosionscratc.repl.co/gist.github.com/Explosion-Scratch/fb8dd1bf2d530f21fe7efb4d167f5546/raw/e34d1e9c4fe01c3138ab6f686bd8f2eb855ec943/bundle.css").then(r => r.text());
    let js = await fetch("https://cors.explosionscratc.repl.co/gist.github.com/Explosion-Scratch/fb8dd1bf2d530f21fe7efb4d167f5546/raw/e34d1e9c4fe01c3138ab6f686bd8f2eb855ec943/bundle.js").then(r => r.text());
    let _code = await fetch("https://cors.explosionscratc.repl.co/gist.github.com/Explosion-Scratch/31baf47ce378150f33db7bda3ecd2a48/raw/ad59b3aa1d4d44563c7ea2f6e2a40b40c6afd2d9/stylash.js").then(r => r.text());
    let code = `
    window.JS_CODE = ${JSON.stringify(js)};
    window.CSS_CODE = ${JSON.stringify(css)};
    ${_code}
    `;
    return code;
}
