let height = "100px"
let font = "Montserrat";
let html = `
<title>Style editor</title>
<script src="https://cdn.jsdelivr.net/npm/less@4"></script>
<script src=https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.js></script>
<script>window.define = ace.define;</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/keybinding-vscode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/mode-less.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ext-language_tools.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.6/ext-beautify.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.0/beautify-css.min.js"></script>
<div id="top">
    <h1>Style editor</h1>
    <label><input type="checkbox" id="live" name="live" checked> Enable live update</label>
    <div id="buttons">
        <button id="beautify" onclick="beautify()">Beautify</button>
        <button id="save" onclick="save()">Save to file</button>
        <button id="copy" onclick="copy()">Copy</button>
        <button id="compile" onclick="compile()">Compile to CSS</button>
    </div>
</div>
<div id=editor></div>
<style>
@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200;0,300;0,400;0,500;1,200;1,300;1,400&family=Work+Sans:wght@300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}');

* {
    margin: 0;
    padding: 0;
}
#editor, #editor *, .ace_tooltip {
    font-family: "Source Code Pro", monospace;
}

#buttons button {
    padding: 5px 10px;
    border: 1px solid #45f4;
    background: #45f1;
    color: white;
    border-radius: 3px;
    cursor: pointer;
    transition: all .2s ease;
}
#buttons button:hover {
    background: #45f3;
}
#buttons button:active {
    transform: scale(.9);
}
#top {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #eee;
    background: #333;
    height: ${height};
    flex-direction: column;
    font-family: '${font}', sans-serif;
}
  #editor {position: absolute; top: ${height}; bottom: 0; left: 0; right: 0}
</style>
<script>
const $ = (a) => document.querySelector(a);
let placeholder = "Write CSS here! Any edits will update the main page in real time. They are also saved in localStorage";
var langTools = ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/less");
editor.setShowPrintMargin(false);
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    placeholder,
});

editor.setValue(localStorage.style_bookmarklet_style || ${JSON.stringify(localStorage.style_bookmarklet_style || "")})

function update() {
    setStyle(editor.session.getValue())
    var shouldShow = !editor.session.getValue().length;
    var node = editor.renderer.emptyMessageNode;
    if (!shouldShow && node) {
        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode);
        editor.renderer.emptyMessageNode = null;
    } else if (shouldShow && !node) {
        node = editor.renderer.emptyMessageNode = document.createElement("div");
        node.textContent = placeholder;
        node.className = "ace_emptyMessage"
        node.style.padding = "0 9px"
        node.style.position = "absolute"
        node.style.zIndex = 9
        node.style.opacity = 0.5
        editor.renderer.scroller.appendChild(node);
    }
}
editor.on("input", update);
setTimeout(update, 100);

async function setStyle(code){
    if (!$("#live").checked){return}
    localStorage.setItem("style_bookmarklet_style", code);
    let w = window.opener;
    w.postMessage({type: "setStorage", code})
    let doc = w.document;
    code = (await less.render(code)).css;
    if (doc.querySelector("#style_bookmarklet_style")){
        doc.querySelector("#style_bookmarklet_style").innerHTML = code;
    } else {
        let style = doc.createElement("style");
        style.id = "style_bookmarklet_style";
        doc.body.insertAdjacentElement("afterend", style);
    }
}
function beautify(){
    setValue(css_beautify(editor.session.getValue()))
}
function save(){
    download(editor.session.getValue(), window.opener.location.hostname.replace(/\\./g, "-") + " style.css", "text/css")
}
async function copy(){
    try {
        await navigator.clipboard.writeText(editor.session.getValue())
    } catch(_){
        prompt("Couldn't copy, copy from here instead: ", editor.session.getValue());
    }
}
async function compile() {
    let {css} = await less.render(editor.session.getValue());
    setValue(css_beautify(css));
}
function setValue(val){
    let o = editor.selection.toJSON();
    editor.session.setValue(val);
    editor.selection.fromJSON(o);
}
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
$("#live").onchange = () => {
    setStyle(editor.session.getValue())
}
</script>
`
let url = URL.createObjectURL(
    new Blob([html], { type: "text/html" })
)

let width = window.outerWidth / 3;
let w = window.open(url, "Style editor", `height=${window.outerHeight},width=${width},left=${window.outerWidth - width},titlebar=no,location=no,menubar=no,toolbar=no`)

window.addEventListener("message", ({data: message}) => {
    if (message.type === "setStorage"){
        localStorage.setItem("style_bookmarklet_style", message.code);
    }
    console.log(message);
})