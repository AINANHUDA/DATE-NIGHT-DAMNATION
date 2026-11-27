
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../references');
const output = path.resolve(__dirname, '../AssetExplorer.html');

const assets = [];

const imageTypes = [
    '.png', '.webp', '.jpg', '.jpeg',
    '.gif', '.svg', '.bmp'
];

const audioTypes = [
    '.mp3', '.wav', '.ogg', '.m4a'
];

const videoTypes = [
    '.mp4', '.webm'
];

function scan(folder, repository) {

    const entries = fs.readdirSync(folder, {
        withFileTypes: true
    });

    for (const entry of entries) {

        const fullPath = path.join(folder, entry.name);

        if (entry.isDirectory()) {

            if (
                entry.name === '.git' ||
                entry.name === 'node_modules'
            ) continue;

            scan(fullPath, repository);
            continue;

        }

        const extension = path.extname(
            entry.name
        ).toLowerCase();

        let type = null;

        if (imageTypes.includes(extension)) {
            type = 'image';
        }

        if (audioTypes.includes(extension)) {
            type = 'audio';
        }

        if (videoTypes.includes(extension)) {
            type = 'video';
        }

        if (!type) continue;

        const relativePath = path.relative(
            path.dirname(output),
            fullPath
        ).replace(/\\/g, '/');

        assets.push({

            name: entry.name,
            repository,
            type,
            path: relativePath,
            size: fs.statSync(fullPath).size

        });

    }

}

if (!fs.existsSync(root)) {

    console.error('Reference folder not found:', root);
    process.exit(1);

}

for (const entry of fs.readdirSync(root, {
    withFileTypes: true
})) {

    if (entry.isDirectory()) {

        scan(
            path.join(root, entry.name),
            entry.name
        );

    }

}

const html = `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>MONKEY MIND III — Asset Explorer</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    background: #080b0e;
    color: #f2e8d5;
    font-family: Arial, sans-serif;
}

header {
    padding: 28px;
    background: #101720;
    border-bottom: 2px solid #b43c48;
}

h1 {
    margin: 0 0 10px;
    color: #e8c078;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px;
    position: sticky;
    top: 0;
    background: #151d28;
    z-index: 10;
}

input, select, button {
    padding: 12px;
    background: #29323c;
    color: white;
    border: 1px solid #495565;
    border-radius: 6px;
    font-size: 14px;
}

input {
    flex: 1;
    min-width: 200px;
}

button {
    cursor: pointer;
}

button:hover {
    border-color: #e8c078;
}

.stats {
    padding: 16px 24px;
    color: #a4a8b2;
}

.gallery {
    padding: 20px;
    display: grid;
    grid-template-columns:
        repeat(auto-fill, minmax(230px, 1fr));
    gap: 16px;
}

.card {
    background: #101720;
    border: 1px solid #354252;
    border-radius: 8px;
    overflow: hidden;
    padding: 12px;
}

.card:hover {
    border-color: #e8c078;
}

.preview {
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-conic-gradient(
        #222831 0% 25%,
        #161b22 0% 50%
    ) 0 0 / 20px 20px;
    overflow: hidden;
    border-radius: 4px;
}

.preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    cursor: zoom-in;
    image-rendering: pixelated;
}

.preview video {
    max-width: 100%;
    max-height: 100%;
}

.preview audio {
    width: 100%;
}

.name {
    color: #e8c078;
    font-weight: bold;
    margin-top: 12px;
    overflow-wrap: anywhere;
}

.repository {
    font-size: 12px;
    color: #52d68a;
    margin: 8px 0;
}

.filepath {
    font-size: 11px;
    color: #a4a8b2;
    overflow-wrap: anywhere;
    margin-bottom: 12px;
}

.card button {
    width: 100%;
    margin-top: 5px;
}

dialog {
    width: 95vw;
    max-width: 95vw;
    height: 90vh;
    background: #101720;
    color: white;
    border: 1px solid #e8c078;
    border-radius: 10px;
    padding: 20px;
}

dialog::backdrop {
    background: rgba(0,0,0,.85);
}

.modal-toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
}

.modal-toolbar span {
    flex: 1;
}

.modal-content {
    height: 75vh;
    overflow: auto;
    margin-top: 15px;
    background: repeating-conic-gradient(
        #222831 0% 25%,
        #161b22 0% 50%
    ) 0 0 / 20px 20px;
}

.modal-content img {
    display: block;
    max-width: none;
    image-rendering: pixelated;
}

</style>

</head>

<body>

<header>
    <h1>MONKEY MIND III</h1>
    <div>COMPLETE REFERENCE ASSET EXPLORER</div>
</header>

<div class="toolbar">

    <input
        id="search"
        placeholder="Search characters, sprites, effects..."
    >

    <select id="repository">
        <option value="all">All repositories</option>
    </select>

    <select id="type">
        <option value="all">All media</option>
        <option value="image">Images</option>
        <option value="audio">Audio</option>
        <option value="video">Videos</option>
    </select>

    <select id="category">
        <option value="all">All categories</option>
        <option value="characters">Characters</option>
        <option value="portraits">Portraits</option>
        <option value="sprites">Sprite sheets</option>
        <option value="effects">Special effects</option>
        <option value="environments">Environments</option>
        <option value="weapons">Weapons</option>
    </select>

</div>

<div class="stats" id="stats"></div>

<div class="gallery" id="gallery"></div>

<dialog id="modal">

    <div class="modal-toolbar">

        <span id="modalTitle"></span>

        <button onclick="zoom(.5)">0.5X</button>
        <button onclick="zoom(1)">1X</button>
        <button onclick="zoom(2)">2X</button>
        <button onclick="zoom(4)">4X</button>

        <button onclick="modal.close()">Close</button>

    </div>

    <div class="modal-content">
        <img id="modalImage">
    </div>

</dialog>

<script>

const assets = ${JSON.stringify(assets).replace(/</g, '\\u003c')};

const gallery = document.getElementById('gallery');
const search = document.getElementById('search');
const repository = document.getElementById('repository');
const type = document.getElementById('type');
const category = document.getElementById('category');

const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');

const repositories = [
    ...new Set(assets.map(a => a.repository))
];

repositories.forEach(name => {

    const option = document.createElement('option');

    option.value = name;
    option.textContent = name;

    repository.appendChild(option);

});

function matchesCategory(asset, selected) {

    const p = asset.path.toLowerCase();

    if (selected === 'all') return true;

    if (selected === 'characters') {

        return /character|portrait|fighter|sprite-sheet-alpha|select\\.webp|-select\\.|cutin|avatar/.test(p);

    }

    if (selected === 'portraits') {

        return /portrait|avatar|cutin|-select\\./.test(p);

    }

    if (selected === 'sprites') {

        return /sprite|idle|walk|run|jump|attack|shoot/.test(p);

    }

    if (selected === 'effects') {

        return /fx-|effect|explosion|lightning|shock|fire-ball|impact|particle/.test(p);

    }

    if (selected === 'environments') {

        return /environment|background|stage|terrain|floor|parallax|elderwood|moonrise|sunspire|harbor/.test(p);

    }

    if (selected === 'weapons') {

        return /weapon|gun|bullet|laser|sword|projectile|bolt/.test(p);

    }

    return true;

}

function openImage(asset) {

    modalImage.src = encodeURI(asset.path);
    modalImage.style.width = 'auto';

    document.getElementById(
        'modalTitle'
    ).textContent = asset.name;

    modal.showModal();

}

function zoom(scale) {

    modalImage.style.width =
        modalImage.naturalWidth * scale + 'px';

}

function addCard(asset) {

    const card = document.createElement('div');

    card.className = 'card';

    const preview = document.createElement('div');

    preview.className = 'preview';

    let media;

    if (asset.type === 'image') {

        media = document.createElement('img');

        media.loading = 'lazy';

        media.onclick = () => openImage(asset);

    } else if (asset.type === 'audio') {

        media = document.createElement('audio');

        media.controls = true;
        media.preload = 'none';

    } else {

        media = document.createElement('video');

        media.controls = true;
        media.preload = 'none';

    }

    media.src = encodeURI(asset.path);

    preview.appendChild(media);
    card.appendChild(preview);

    const name = document.createElement('div');

    name.className = 'name';
    name.textContent = asset.name;

    card.appendChild(name);

    const repo = document.createElement('div');

    repo.className = 'repository';
    repo.textContent = asset.repository;

    card.appendChild(repo);

    const filepath = document.createElement('div');

    filepath.className = 'filepath';
    filepath.textContent = asset.path;

    card.appendChild(filepath);

    const open = document.createElement('button');

    open.textContent = 'Open original file';

    open.onclick = () => {

        window.open(
            encodeURI(asset.path),
            '_blank'
        );

    };

    card.appendChild(open);

    gallery.appendChild(card);

}

function render() {

    const query = search.value.toLowerCase();

    const filtered = assets.filter(asset => {

        return (

            (
                repository.value === 'all' ||
                asset.repository === repository.value
            ) &&

            (
                type.value === 'all' ||
                asset.type === type.value
            ) &&

            asset.path.toLowerCase().includes(query) &&

            matchesCategory(asset, category.value)

        );

    });

    gallery.replaceChildren();

    document.getElementById('stats').textContent =
        'Showing ' + filtered.length +
        ' of ' + assets.length + ' media files';

    filtered.forEach(addCard);

}

search.addEventListener('input', render);
repository.addEventListener('change', render);
type.addEventListener('change', render);
category.addEventListener('change', render);

render();

</script>

</body>

</html>
`;

fs.writeFileSync(output, html, 'utf8');

console.log('\nASSET EXPLORER GENERATED');
console.log('Total assets:', assets.length);

console.log(
    'Images:',
    assets.filter(a => a.type === 'image').length
);

console.log(
    'Audio:',
    assets.filter(a => a.type === 'audio').length
);

console.log(
    'Videos:',
    assets.filter(a => a.type === 'video').length
);

console.log('Output:', output);
