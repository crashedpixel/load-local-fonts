const fs = require('fs');

function getPathOption() {
    const path = process.argv.find(arg => arg.match('--path='));
    if (path) {
        if (path.substr(-1) !== '/') {
            return `${path.substr(7)}/`;
        }
        return path.substr(7);
    } else {
        console.error('Error! Missing --path argv');
        process.exit(1);
    }
}

function getExtensionOption() {
    const extensions = process.argv.find(arg => arg.match('--extensions='));
    if (extensions) {
        return extensions.substr(13).split(',');
    } else {
        return ['eot', 'ttf', 'woff2', 'woff'];
    }
}

const opt = {
    verbose: process.argv.indexOf('--verbose') > -1,
    path: getPathOption(),
    extensions: getExtensionOption()
};

let fonts = [];
let dir = fs.readdirSync(opt.path);

dir.filter(file => file.match(new RegExp(opt.extensions.join('|'))))
    .forEach(file => {
        const name = file.match(/\w+/)[0];

        function getExtension() {
            return file.match(/\.\w+$/)[0].substr(1);
        }

        function getWeight() {
            const googleNames = ['light', 'regular', 'semibold', 'extrabold', 'bold'];
            const googleDef = {
                'light': 300,
                'regular': 400,
                'semibold': 600,
                'extrabold': 800,
                'bold': 700
            };
            const match = googleNames.find(str => file.match(new RegExp(str, 'i')));
            if (match) {
                return `font-weight: ${googleDef[match]};`;
            }
            return '';
        }

        function getStyle() {
            if (file.match(/italic/i)) {
                return 'font-style: italic;';
            }
            return 'font-style: normal;';
        }

        function getBase64() {
            if (opt.verbose) {
                console.log(`encrypting ${opt.path}${file}`);
            }

            const content = fs.readFileSync(`${opt.path}${file}`);
            return content.toString('base64');
        }

        if (!fonts[name]) {
            fonts[name] = [];
        }

        fonts[name].push(`@font-face {
            font-family: '${name}';
            ${getStyle()}
            ${getWeight()}
            font-display: swap;
            src: url(data:application/x-font-${getExtension()};base64,${getBase64()});}`.trim('').replace(/\s{2,}/g, ''));
    });

for (font in fonts) {
    let styles = '';
    fonts[font].forEach(content => styles = styles.concat(content));
    fs.writeFileSync(`${opt.path}${font}.json`, `{"style": "${styles}"}`);

    if (opt.verbose) {
        console.log(`saving ${opt.path}${font}.json (${fonts[font].length})`);
    }
}

if (!opt.verbose) {
    console.log(`encrypted fonts in ${opt.path}`);
}

